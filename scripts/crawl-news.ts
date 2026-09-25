import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { momentLine } from "../src/data/moment";
import type { CaseRow } from "../src/data/types";
import { familyLine } from "../src/data/logic";
import { articleDeathAbroad, locationOutsideBangladesh } from "./abroad";
import { extractArticle, htmlToText, type NewsDraft } from "./extract-news";

const CASES_PATH = resolve("src/data/cases.json");
const WRITE = process.argv.includes("--write");
const FEEDS = [
  "https://www.tbsnews.net/rss.xml",
  "https://www.thedailystar.net/frontpage/rss.xml",
  "https://www.prothomalo.com/stories.rss",
  "https://www.thedailystar.net/news/bangladesh/accidents-fires/rss.xml",
];
const INTEREST = /compensation|cheque|killed|died|death|accident|নিহত|মৃত্যু|ক্ষতিপূরণ|দুর্ঘটনা|চেক/i;
const MAX_FETCHES = 8;

const OUTLETS: Record<string, string> = {
  "thedailystar.net": "The Daily Star",
  "prothomalo.com": "Prothom Alo",
  "tbsnews.net": "The Business Standard",
  "banglatribune.com": "Bangla Tribune",
  "kalerkantho.com": "Kaler Kantho",
  "jugantor.com": "Jugantor",
  "bbc.com": "BBC Bangla",
  "bdnews24.com": "bdnews24.com",
};

type FeedItem = { title: string; url: string };

function log(url: string, reason: string) {
  console.log(JSON.stringify({ skipped: url || "(feed)", reason }));
}

function normUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname.replace(/^www\./, "")}${parsed.pathname.replace(/\/$/, "")}`;
  } catch {
    return url;
  }
}

function outletOf(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").replace(/^bangla\./, "").replace(/^en\./, "");
    return OUTLETS[host] ?? null;
  } catch {
    return null;
  }
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function feedItems(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  for (const block of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const body = block[1];
    const titleRaw = body.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const link = body.match(/<link>([^<]+)<\/link>/i)?.[1]?.trim();
    const title = htmlToText(titleRaw.replace(/<!\[CDATA\[|\]\]>/g, ""));
    if (link && title) items.push({ title, url: link });
  }
  return items;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { "user-agent": "KhotipuronNewsBot/1.0 (compensation facts only)" },
    redirect: "follow",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

function personKey(row: { nameEn: string | null; nameBn: string | null; incidentDate: string | null }): string | null {
  if (!row.incidentDate) return null;
  const name = (row.nameEn || row.nameBn || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!name) return null;
  return `${name}|${row.incidentDate}`;
}

function rowFrom(draft: NewsDraft, url: string, outlet: string, id: string): CaseRow {
  return {
    id,
    scene: draft.scene,
    url,
    outlet,
    published: draft.published,
    incidentDate: draft.incidentDate,
    locationEn: draft.locationEn,
    locationBn: draft.locationBn,
    nameEn: draft.nameEn,
    nameBn: draft.nameBn,
    age: draft.age,
    sex: draft.sex,
    doingEn: draft.doingEn,
    doingBn: draft.doingBn,
    actEn: draft.actEn,
    actBn: draft.actBn,
    othersDied: false,
    amountBdt: draft.amountBdt,
    amountKind: draft.amountKind,
    paid: draft.paid,
    quoteEn: draft.quoteEn,
    quoteBn: draft.quoteBn,
    also: null,
    noteEn: null,
    noteBn: null,
    extraSources: [],
  };
}

async function main() {
  const existing = JSON.parse(readFileSync(CASES_PATH, "utf8")) as CaseRow[];
  const seenUrls = new Set<string>();
  const seenPeople = new Set<string>();
  for (const row of existing) {
    seenUrls.add(normUrl(row.url));
    for (const extra of row.extraSources) seenUrls.add(normUrl(extra.url));
    const key = personKey(row);
    if (key) seenPeople.add(key);
  }

  const candidates: FeedItem[] = [];
  for (const feed of FEEDS) {
    try {
      const xml = await fetchText(feed);
      const items = feedItems(xml);
      if (items.length === 0) {
        log(feed, "feed had no items");
        continue;
      }
      for (const item of items) {
        if (!INTEREST.test(`${item.title} ${item.url}`)) continue;
        candidates.push(item);
      }
    } catch (error) {
      log(feed, error instanceof Error ? error.message : "feed failed");
    }
  }

  const moneyTitle = /compensation|cheque|ক্ষতিপূরণ|চেক|lakh|লাখ|টাকা|crore|কোটি/i;
  candidates.sort((a, b) => Number(moneyTitle.test(b.title)) - Number(moneyTitle.test(a.title)));

  const accepted: CaseRow[] = [];
  let fetched = 0;
  const seenThisRun = new Set<string>();
  for (const item of candidates) {
    if (fetched >= MAX_FETCHES) {
      log(item.url, "fetch limit for this run");
      continue;
    }
    const urlKey = normUrl(item.url);
    if (seenUrls.has(urlKey) || seenThisRun.has(urlKey)) {
      log(item.url, "already collected");
      continue;
    }
    const outlet = outletOf(item.url);
    if (!outlet) {
      log(item.url, "source is outside the paper list");
      continue;
    }
    fetched += 1;
    let page = "";
    try {
      page = htmlToText(await fetchText(item.url));
    } catch (error) {
      log(item.url, error instanceof Error ? error.message : "article failed");
      continue;
    }
    const extracted = extractArticle(page);
    if (!extracted.ok) {
      log(item.url, extracted.reason);
      continue;
    }
    const draft = extracted.draft;
    if (locationOutsideBangladesh(draft.locationEn, draft.locationBn) || articleDeathAbroad(page)) {
      log(item.url, "death happened outside Bangladesh");
      continue;
    }
    const who = personKey(draft);
    if (who && seenPeople.has(who)) {
      log(item.url, "same victim and date already collected");
      continue;
    }
    const base = slug(draft.nameEn || "") || slug(new URL(item.url).pathname) || "report";
    const year = (draft.incidentDate ?? draft.published).slice(0, 4);
    let id = `${base}-${year}`;
    const taken = new Set([...existing, ...accepted].map((row) => row.id));
    let n = 2;
    while (taken.has(id)) {
      id = `${base}-${year}-${n}`;
      n += 1;
    }
    const row = rowFrom(draft, item.url, outlet, id);
    try {
      const spoken = `${momentLine(row, "walk", "bn")} ${momentLine(row, "walk", "en")} ${familyLine(row, "bn")}`;
      if (spoken.includes("অঙ্ক") || /worth/i.test(spoken)) throw new Error("summary drifted");
      if (row.nameBn && momentLine(row, "walk", "bn").includes(row.nameBn)) throw new Error("countdown names them");
      if (row.nameEn && momentLine(row, "walk", "en").includes(row.nameEn)) throw new Error("countdown names them");
    } catch (error) {
      log(item.url, error instanceof Error ? error.message : "case failed validation");
      continue;
    }
    accepted.push(row);
    seenThisRun.add(urlKey);
    seenUrls.add(urlKey);
    if (who) seenPeople.add(who);
    console.log(JSON.stringify({ accepted: row.id, url: row.url, amountBdt: row.amountBdt, paid: row.paid }));
  }

  if (accepted.length === 0) {
    console.log(JSON.stringify({ accepted: 0, write: false }));
    return;
  }
  if (!WRITE) {
    console.log(JSON.stringify({ accepted: accepted.length, write: false, note: "dry run" }));
    return;
  }
  const next = JSON.stringify([...existing, ...accepted], null, 2) + "\n";
  writeFileSync(CASES_PATH, next);
  console.log(JSON.stringify({ accepted: accepted.length, write: true }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
