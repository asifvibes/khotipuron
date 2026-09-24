import { cases } from "../src/data/cases";
import {
  familyLine,
  hasDigit,
  incidentSummary,
  kindSpan,
  ogDescription,
  ogTitle,
  pickUnseen,
  publicCaseUrl,
  shareText,
} from "../src/data/logic";

const ids = cases.map((row) => row.id);
if (new Set(ids).size !== ids.length) {
  throw new Error("duplicate case id");
}

const digit = /[0-9০-৯]/;
for (const row of cases) {
  if (row.amountKind === "none") {
    if (row.amountBdt !== null) throw new Error(`${row.id} none kind has an amount`);
    if (digit.test(row.quoteEn) || digit.test(row.quoteBn)) {
      throw new Error(`${row.id} none quote contains a digit`);
    }
    if (row.also) throw new Error(`${row.id} none case has a second amount`);
  } else if (row.amountBdt == null || row.amountBdt <= 0) {
    throw new Error(`${row.id} missing amount`);
  }
  const text = `${row.quoteEn} ${row.noteEn ?? ""} ${row.doingEn ?? ""}`.toLowerCase();
  if (text.includes("worth") || text.includes("akash") || text.includes("17-year")) {
    throw new Error(`${row.id} has a forbidden phrase`);
  }
}

const seen = new Set<string>();
let guard = 0;
while (guard < cases.length + 2) {
  const next = pickUnseen(cases, seen, () => 0);
  if (!next) break;
  if (seen.has(next.id)) throw new Error("pick returned a seen id");
  seen.add(next.id);
  guard += 1;
}
if (seen.size !== cases.length) throw new Error(`draw stopped at ${seen.size}`);
if (pickUnseen(cases, seen) !== null) throw new Error("pool recycled");

for (const row of cases) {
  for (const lang of ["bn", "en"] as const) {
    const spoken = [familyLine(row, lang), shareText(row, lang), incidentSummary(row, lang)].join("\n");
    if (/worth/i.test(spoken) || spoken.includes("জীবনের দাম")) {
      throw new Error(`${row.id} prices a life`);
    }
    if (row.amountBdt == null && hasDigit(spoken)) {
      throw new Error(`${row.id} ${lang} prints a digit without an amount`);
    }
  }
  if (row.amountBdt == null && (hasDigit(ogTitle(row)) || hasDigit(ogDescription(row)))) {
    throw new Error(`${row.id} preview prints a digit`);
  }
  const url = publicCaseUrl(row.id);
  if (url !== `https://khotipuron.com/c/${row.id}`) throw new Error(`${row.id} public url`);
  if (!shareText(row, "bn").includes("ক্ষতিপূরণ") || shareText(row, "bn").includes("Khotipuron")) {
    throw new Error(`${row.id} bangla share is not one language`);
  }
  if (!shareText(row, "en").includes("Khotipuron") || shareText(row, "en").includes("ক্ষতিপূরণ")) {
    throw new Error(`${row.id} english share is not one language`);
  }
  if (ogDescription(row).includes("Khotipuron")) {
    throw new Error(`${row.id} preview repeats English`);
  }
}

const firoza = cases.find((row) => row.id === "firoza-begum-shibganj");
if (!firoza || !familyLine(firoza, "en").includes("Firoza Begum") || !firoza.url.includes("accidents-and-fires")) {
  throw new Error("firoza line or url");
}

const roadGov = kindSpan(cases, "road", "government");
if (!roadGov || roadGov.low !== 20000 || roadGov.high !== 25000) {
  throw new Error(`unexpected road government span ${JSON.stringify(roadGov)}`);
}

console.log(`ok ${cases.length} cases, draw does not recycle`);
