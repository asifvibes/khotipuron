import type { AmountKind, SceneType, Sex } from "../src/data/types";
import { formatTaka } from "../src/data/logic";
import { articleDeathAbroad } from "./abroad";

export type NewsDraft = {
  scene: SceneType;
  published: string;
  incidentDate: string | null;
  nameEn: string | null;
  nameBn: string | null;
  age: number | null;
  sex: Sex;
  actEn: string;
  actBn: string;
  doingEn: string | null;
  doingBn: string | null;
  amountBdt: number;
  paid: boolean;
  amountKind: AmountKind;
  locationEn: string;
  locationBn: string;
  quoteEn: string;
  quoteBn: string;
};

export type ExtractResult = { ok: true; draft: NewsDraft } | { ok: false; reason: string };

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  জানুয়ারি: 1,
  ফেব্রুয়ারি: 2,
  মার্চ: 3,
  এপ্রিল: 4,
  মে: 5,
  জুন: 6,
  জুলাই: 7,
  আগস্ট: 8,
  সেপ্টেম্বর: 9,
  অক্টোবর: 10,
  নভেম্বর: 11,
  ডিসেম্বর: 12,
};

const BN_DIGIT = "০১২৩৪৫৬৭৮৯";

const SCENE_RULES: { scene: SceneType; pattern: RegExp }[] = [
  { scene: "open_drain", pattern: /open drain|খোলা ড্রেন/i },
  { scene: "rail", pattern: /\brailway\b|\brail\b|\btrain\b|রেল|ট্রেনের/ },
  { scene: "river", pattern: /\briver\b|\btrawler\b|\blaunch\b|drowned|নদী|লঞ্চ/i },
  { scene: "fire", pattern: /\bfire\b|\bblaze\b|আগুন|অগ্নিকাণ্ড/i },
  { scene: "workplace", pattern: /factory|shipbreaking|shipyard|\byard\b|\bworker\b|কারখানা|শিপইয়ার্ড|শিপ ব্রেক/i },
  { scene: "neglect", pattern: /bearing pad|negligence|wall collapsed|cylinder fell|বিয়ারিং|বিয়ারিং|অবহেলা/i },
  { scene: "road", pattern: /road crash|road accident|motorcycle|auto-rickshaw|\btruck\b|\bbus\b|সড়ক|সড়ক|মোটরসাইকেল|অটোরিকশা/i },
];

export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function fromBanglaDigits(value: string): string {
  return value.replace(/[০-৯]/g, (digit) => String(BN_DIGIT.indexOf(digit)));
}

function iso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1990 || year > 2100) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function findDates(text: string): string[] {
  const found: string[] = [];
  const add = (year: number, monthName: string, day: number) => {
    const month = MONTHS[monthName.toLowerCase()] ?? MONTHS[monthName];
    if (!month) return;
    const value = iso(year, month, day);
    if (value && !found.includes(value)) found.push(value);
  };
  for (const match of text.matchAll(/\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/g)) {
    add(Number(match[3]), match[2], Number(match[1]));
  }
  for (const match of text.matchAll(/\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/g)) {
    add(Number(match[3]), match[1], Number(match[2]));
  }
  for (const match of text.matchAll(/([০-৯]{1,2})\s+([^\s০-৯]{2,12})\s+([০-৯]{4})/g)) {
    add(Number(fromBanglaDigits(match[3])), match[2], Number(fromBanglaDigits(match[1])));
  }
  return found;
}

function parseAmountToken(rawNumber: string, unit: string | undefined): number | null {
  const digits = fromBanglaDigits(rawNumber).replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(digits)) return null;
  const value = Number(digits);
  if (!Number.isFinite(value) || value <= 0) return null;
  const scale = (unit ?? "").toLowerCase();
  const scaled = scale === "crore" || scale === "কোটি" ? value * 10000000 : scale === "lakh" || scale === "lac" || scale === "লাখ" ? value * 100000 : value;
  if (scaled < 1000 || scaled > 500000000 || !Number.isInteger(scaled)) return null;
  return scaled;
}

function amountsIn(text: string): number[] {
  const found = new Set<number>();
  const patterns: RegExp[] = [
    /(?:Tk\.?|BDT|৳)\s*([0-9][0-9,]*)(?:\s*(crore|lakh|lac))?/gi,
    /([০-৯][০-৯,]*)\s*(লাখ|কোটি)?\s*টাকা/g,
    /([0-9][0-9,]*)\s*(lakh|lac|crore)\s*(?:taka|tk)\b/gi,
  ];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) {
      const amount = parseAmountToken(match[1], match[2]);
      if (amount != null) found.add(amount);
    }
  }
  return [...found];
}

function sentencesOf(text: string): string[] {
  return text
    .split(/(?<=[।.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function paymentOf(sentence: string): "paid" | "mentioned" | null {
  const promised = /would be|will be|would receive|will receive|promised|announced|assured|দেওয়া হবে|দেবে|পাবে|ঘোষণা|আশ্বাস|দাবি/.test(sentence);
  const paid = /handed over|has received|have received|received a|was given|were given|gave\b|দিয়েছে|পেয়েছে|তুলে দেওয়া হয়েছে|দেওয়া হয়েছে/.test(sentence);
  if (paid && !/would be|will be|দেওয়া হবে/.test(sentence)) return "paid";
  if (promised && !paid) return "mentioned";
  if (paid) return "paid";
  return null;
}

function accusedIsUnder18(text: string): boolean {
  const windows = text.match(/(?:driver|accused|চালক|আসামি).{0,50}/gi) ?? [];
  return windows.some((window) => {
    const ages = [
      ...window.matchAll(/\b(1[0-7]|[1-9])\b/g),
      ...window.matchAll(/[০-৯]{1,2}/g),
    ].map((match) => Number(fromBanglaDigits(match[0])));
    return ages.some((age) => age >= 1 && age <= 17);
  });
}

function sceneOf(text: string): SceneType | null {
  const hits = SCENE_RULES.filter((rule) => rule.pattern.test(text)).map((rule) => rule.scene);
  const unique = [...new Set(hits)];
  if (unique.length !== 1) return null;
  return unique[0];
}

function actOf(text: string): Pick<NewsDraft, "actEn" | "actBn" | "doingEn" | "doingBn"> {
  if (/footpath|ফুটপাত/i.test(text)) {
    return {
      actEn: "was walking along a footpath",
      actBn: "ফুটপাত দিয়ে চলছিলেন",
      doingEn: "Walking along a footpath",
      doingBn: "ফুটপাত দিয়ে চলছিলেন",
    };
  }
  if (/gone fishing|fishing|মাছ ধর/i.test(text)) {
    return {
      actEn: "had gone fishing",
      actBn: "মাছ ধরতে গিয়েছিলেন",
      doingEn: "Going fishing",
      doingBn: "মাছ ধরতে গিয়েছিলেন",
    };
  }
  if (/auto-rickshaw|অটোরিকশা/i.test(text)) {
    return {
      actEn: "was in an auto-rickshaw",
      actBn: "অটোরিকশায় ছিলেন",
      doingEn: "Travelling in an auto-rickshaw",
      doingBn: "অটোরিকশায় ছিলেন",
    };
  }
  if (/motorcycle|মোটরসাইকেল/i.test(text)) {
    return {
      actEn: "was on a motorcycle",
      actBn: "মোটরসাইকেলে ছিলেন",
      doingEn: "Riding a motorcycle",
      doingBn: "মোটরসাইকেলে ছিলেন",
    };
  }
  return {
    actEn: "was there",
    actBn: "ছিলেন",
    doingEn: null,
    doingBn: null,
  };
}

type Named = { nameEn: string | null; nameBn: string | null; age: number | null };

function nameOf(text: string): Named | "many" {
  const english: Named[] = [];
  for (const match of text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})(?:,\s*(\d{1,2}))?\s+was killed\b/g)) {
    english.push({ nameEn: match[1], nameBn: null, age: match[2] ? Number(match[2]) : null });
  }
  for (const match of text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3}),\s*(\d{1,2}),\s+(?:died|was killed)\b/g)) {
    english.push({ nameEn: match[1], nameBn: null, age: Number(match[2]) });
  }
  for (const match of text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\s*\((?:(\d{1,2})|([০-৯]{2}))\)\s+(?:died|was killed)\b/g)) {
    const age = Number(fromBanglaDigits(match[2] || match[3] || ""));
    english.push({ nameEn: match[1], nameBn: null, age: age || null });
  }
  const bangla: Named[] = [];
  for (const match of text.matchAll(/([অ-হ][^\s,()]{1,14}(?:\s[অ-হ][^\s,()]{1,14}){0,2})\s*\(([০-৯]{2})\)/g)) {
    const age = Number(fromBanglaDigits(match[2]));
    if (age >= 1 && age <= 100) bangla.push({ nameEn: null, nameBn: match[1], age });
  }
  const names = [...english, ...bangla];
  const keys = new Set(names.map((item) => `${item.nameEn ?? ""}|${item.nameBn ?? ""}`));
  if (keys.size > 1) return "many";
  return names[0] ?? { nameEn: null, nameBn: null, age: null };
}

function kindOf(sentence: string, paid: boolean): AmountKind {
  if (!paid) {
    if (/demand|দাবি/.test(sentence)) return "demanded";
    return "promised";
  }
  if (/court|tribunal|আদালত/.test(sentence)) return "court";
  if (/insurance|insurer|বিমা/.test(sentence)) return "insurance";
  if (/BRTA|government|administration|ministry|বিআরটিএ|সরকার|প্রশাসন|মন্ত্রণালয়/.test(sentence)) return "government";
  if (/company|employer|owner|factory|মালিক|কোম্পানি|কারখানা/.test(sentence)) return "employer";
  return "said_handed";
}

function multipleVictims(text: string): boolean {
  return (
    /\b(?:\d+|two|three|four|five|six|seven|eight|nine|ten)\s+(?:people|persons|workers|sailors|families|victims)\b/i.test(text) ||
    /[০-৯]+\s*জন/.test(text) ||
    /পরিবারগুলো|নিহতদের পরিবার/.test(text)
  );
}

export function extractArticle(text: string): ExtractResult {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length < 80) return { ok: false, reason: "page is too short to support a case" };
  if (accusedIsUnder18(clean)) return { ok: false, reason: "an accused person is under 18" };
  if (!/\b(killed|died|death)\b|নিহত|মারা গে|মারা যান|মৃত্যু/.test(clean)) return { ok: false, reason: "no death in the page" };
  if (articleDeathAbroad(clean)) return { ok: false, reason: "death happened outside Bangladesh" };
  if (!/compensation|cheque|ক্ষতিপূরণ|চেক/.test(clean)) return { ok: false, reason: "no compensation in the page" };
  if (multipleVictims(clean)) return { ok: false, reason: "more than one victim, not split automatically" };

  const scene = sceneOf(clean);
  if (!scene) return { ok: false, reason: "scene is missing or ambiguous" };

  const moneySentences = sentencesOf(clean).filter((sentence) => /compensation|cheque|ক্ষতিপূরণ|চেক|টাকা|Tk\b/i.test(sentence));
  const amounts = amountsIn(moneySentences.join(" "));
  if (amounts.length === 0) return { ok: false, reason: "no compensation amount" };
  if (amounts.length > 1) return { ok: false, reason: "more than one compensation amount" };
  const amountBdt = amounts[0];
  const sentence = moneySentences.find((item) => amountsIn(item).includes(amountBdt)) ?? moneySentences[0];
  const payment = paymentOf(sentence);
  if (!payment) return { ok: false, reason: "payment status is unclear" };

  const named = nameOf(clean);
  if (named === "many") return { ok: false, reason: "more than one named person" };

  const dated = sentencesOf(clean).flatMap((sentence) => findDates(sentence).map((date) => ({ date, sentence })));
  if (dated.length === 0) return { ok: false, reason: "no report date" };
  const published = [...dated.map((item) => item.date)].sort().at(-1);
  if (!published) return { ok: false, reason: "no report date" };
  const deathDated = dated.filter(
    (item) =>
      /\b(killed|died|death)\b|নিহত|মারা গে|মারা যান|মৃত্যু/.test(item.sentence) &&
      !/published|updated|প্রকাশ|আপডেট/i.test(item.sentence),
  );
  const incidentDates = [...new Set(deathDated.map((item) => item.date))];
  const incidentDate = incidentDates.length === 1 ? incidentDates[0] : null;

  const act = actOf(clean);
  const paid = payment === "paid";
  const takaEn = formatTaka(amountBdt, "en");
  const takaBn = formatTaka(amountBdt, "bn");
  return {
    ok: true,
    draft: {
      scene,
      published,
      incidentDate,
      nameEn: named.nameEn,
      nameBn: named.nameBn,
      age: named.age,
      sex: "not_stated",
      ...act,
      amountBdt,
      paid,
      amountKind: kindOf(sentence, paid),
      locationEn: "",
      locationBn: "",
      quoteEn: paid
        ? `The article says ${takaEn} was handed over.`
        : `The article says ${takaEn} was named as compensation, and does not say it was paid.`,
      quoteBn: paid
        ? `খবরে বলা হয়েছে, ${takaBn} তুলে দেওয়া হয়েছে।`
        : `খবরে ${takaBn} ক্ষতিপূরণ হিসেবে উল্লেখ আছে। টাকা হাতে পৌঁছেছে, এমন কথা লেখা নেই।`,
    },
  };
}
