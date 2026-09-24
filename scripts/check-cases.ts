import { cases } from "../src/data/cases";
import { momentLine } from "../src/data/moment";
import {
  familyLine,
  stakeLine,
  hasDigit,
  inDraw,
  incidentSummary,
  kindSpan,
  NO_AMOUNT_BN,
  NO_AMOUNT_EN,
  ogDescription,
  ogTitle,
  paymentRank,
  pickUnseen,
  publicCaseUrl,
  shareText,
  toBnDigits,
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
    if (row.quoteBn !== NO_AMOUNT_BN || row.quoteEn !== NO_AMOUNT_EN) {
      throw new Error(`${row.id} none quote drifted`);
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

const drawIds = cases.filter(inDraw).map((row) => row.id);
const seen = new Set<string>();
const order: (typeof cases)[number][] = [];
let guard = 0;
while (guard < cases.length + 2) {
  const next = pickUnseen(cases, seen, () => 0);
  if (!next) break;
  if (seen.has(next.id)) throw new Error("pick returned a seen id");
  if (!inDraw(next)) throw new Error(`${next.id} was drawn outside the pool`);
  seen.add(next.id);
  order.push(next);
  guard += 1;
}
if (seen.size !== cases.length) throw new Error(`draw stopped at ${seen.size}, file has ${cases.length}`);
if (pickUnseen(cases, seen) !== null) throw new Error("pool recycled");
const moneyCount = cases.filter((row) => row.amountBdt != null).length;
if (order.slice(0, moneyCount).some((row) => row.amountBdt == null)) throw new Error("a no-amount case played before the amounts");
if (order.slice(moneyCount).some((row) => row.amountBdt != null)) throw new Error("an amount case played after the rest");
let rankSeen = 0;
for (const row of order) {
  const rank = paymentRank(row);
  if (rank < rankSeen) throw new Error(`${row.id} played before an earlier payment rank`);
  rankSeen = rank;
}
for (const row of cases) {
  if (row.paid === true && row.amountBdt == null) throw new Error(`${row.id} is paid without an amount`);
}
if (!seen.has("khalid-rahman-kurigram")) throw new Error("a collected case was left out of the draw");

for (const row of cases) {
  for (const lang of ["bn", "en"] as const) {
    const spoken = [familyLine(row, lang), shareText(row, lang), incidentSummary(row, lang)].join("\n");
    if (/worth/i.test(spoken) || spoken.includes("জীবনের দাম")) {
      throw new Error(`${row.id} prices a life`);
    }
    if (row.amountBdt == null && hasDigit(stripPlaceAndAge(row, spoken))) {
      throw new Error(`${row.id} ${lang} prints a digit without an amount`);
    }
    if (row.amountBdt == null && lang === "bn" && familyLine(row, "bn") !== NO_AMOUNT_BN) {
      throw new Error(`${row.id} bangla line drifted`);
    }
    if (row.amountBdt == null && lang === "en" && familyLine(row, "en") !== NO_AMOUNT_EN) {
      throw new Error(`${row.id} english line drifted`);
    }
    if (spoken.includes("অঙ্ক")) throw new Error(`${row.id} uses অঙ্ক`);
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

function stripPlaceAndAge(row: (typeof cases)[number], text: string): string {
  let next = text;
  if (row.age != null) {
    next = next.split(String(row.age)).join("").split(toBnDigits(String(row.age))).join("");
  }
  for (const place of [row.locationBn, row.locationEn]) {
    if (place) next = next.split(place).join("");
  }
  return next;
}

const mehedi = cases.find((row) => row.id === "mehedi-hasan-mim-baridhara");
const mehediBn =
  "এই ধরনের ঘটনায় কেউ মারা গেলে পরিবার ৯,০০,০০০ টাকা পেতে পারে। নিউজ আর্টিকেলে এই টাকার এমাউন্টের কথাই বলেছে । মেহেদী হাসান মিম-এর পরিবারের জন্য এমন টাকাই দেয়া হবে বলা হয়েছে।";
const mehediFacts =
  "মেহেদী হাসান মিম, বয়স ২৪ বছর। ফুটপাতে বসে ছিলেন। তিনি নির্মাণশ্রমিক। খবরে ঘটনাস্থল ঢাকার বারিধারা কূটনৈতিক এলাকা, রোড নম্বর ১।";
if (!mehedi || familyLine(mehedi, "bn") !== mehediBn || incidentSummary(mehedi, "bn") !== mehediFacts) {
  throw new Error("mehedi page drifted");
}
if (familyLine(mehedi, "bn").includes("টাকার ধরন") || familyLine(mehedi, "en").includes("said handed")) {
  throw new Error("mehedi still names the money's kind");
}
const mehediStake =
  "আপনি এভাবে মারা গেলে আপনার জীবনের মূল্য হবে ৯,০০,০০০ টাকা। খুব কম হয়ে গেল না? নাকি বেশি?";
if (stakeLine(mehedi, "bn") !== mehediStake) throw new Error(`mehedi stake drifted: ${stakeLine(mehedi, "bn")}`);
const unnamed = cases.find((row) => row.id === "unnamed-cng-passenger-trishal");
const unnamedStake =
  "আপনি এভাবে মারা গেলে আপনার পরিবার মনে হয় না কোনো ক্ষতিপূরণ পাবে, কারণ পরিবারটি কোনো টাকা পায়নি ক্ষতিপূরণ হিসেবে। হায়রে কপাল!";
if (!unnamed || unnamed.nameBn || stakeLine(unnamed, "bn") !== unnamedStake) {
  throw new Error(`unnamed stake drifted: ${unnamed ? stakeLine(unnamed, "bn") : "missing"}`);
}
if (stakeLine(unnamed, "en").includes("null") || !stakeLine(unnamed, "en").includes("that family")) {
  throw new Error("unnamed english stake invents a name");
}
for (const row of cases) {
  const bn = stakeLine(row, "bn");
  if (bn.includes("বেশী")) throw new Error(`${row.id} spells বেশী`);
  if (row.amountBdt != null) {
    if (!bn.includes("নাকি বেশি?") || !bn.endsWith("নাকি বেশি?")) throw new Error(`${row.id} amount stake drifted`);
  } else {
    if (!bn.includes("কোনো ক্ষতিপূরণ") || !bn.includes("পায়নি") || !bn.includes("হিসেবে")) {
      throw new Error(`${row.id} no-amount stake drifted`);
    }
    if (!row.nameBn && !bn.includes("পরিবারটি")) throw new Error(`${row.id} blank name`);
    if (row.nameBn && !bn.includes(`${row.nameBn}-এর পরিবার`)) throw new Error(`${row.id} stake drops the name`);
  }
}

const bannedCountdown = ["মাসেরর", "তার্ক্ষই", "মানুহশ", "তেমননি", "বিশ্রাম", "বেস", "আপনি যেমন", "রাস্তা পার হন"];
for (const row of cases) {
  const bn = momentLine(row, "walk", "bn");
  const en = momentLine(row, "sit", "en");
  if (bn !== momentLine(row, "sit", "bn") || en !== momentLine(row, "walk", "en")) {
    throw new Error(`${row.id} countdown still depends on the pose`);
  }
  if (!bn.includes("একজন মানুষ ") || bn.includes("আপনি")) throw new Error(`${row.id} countdown shape`);
  if (row.incidentDate && !/^[০-৯]+ সালের .+ মাসের [০-৯]+ তারিখে একজন মানুষ /.test(bn)) {
    throw new Error(`${row.id} countdown does not open with the date`);
  }
  if (!row.incidentDate && !bn.startsWith("একজন মানুষ ")) throw new Error(`${row.id} countdown shape`);
  if (row.incidentDate && !/^On \d+ \S+ \d{4}, a person /.test(en)) throw new Error(`${row.id} english countdown shape`);
  if (!row.incidentDate && !en.startsWith("A person ")) throw new Error(`${row.id} english countdown shape`);
  if (row.nameBn && bn.includes(row.nameBn)) throw new Error(`${row.id} countdown names them`);
  if (row.nameEn && (bn.includes(row.nameEn) || en.includes(row.nameEn))) throw new Error(`${row.id} countdown names them in English`);
  if (bannedCountdown.some((bad) => bn.includes(bad) || en.includes(bad))) throw new Error(`${row.id} countdown typo`);
  if (row.amountBdt != null && (bn.includes(String(row.amountBdt)) || en.includes(String(row.amountBdt)))) {
    throw new Error(`${row.id} countdown states an amount`);
  }
  if (!row.incidentDate && (bn.includes("সালের") || /\bOn \d/.test(en))) throw new Error(`${row.id} countdown invents a date`);
}
const mehediSit = momentLine(mehedi, "sit", "bn");
if (mehediSit !== "২০২৬ সালের সেপ্টেম্বর মাসের ২২ তারিখে একজন মানুষ ফুটপাতে বসে ছিলেন।") {
  throw new Error(`mehedi countdown drifted: ${mehediSit}`);
}
const nur = cases.find((row) => row.id === "nur-alam-patharghata");
const nurLine = "২০২৬ সালের আগস্ট মাসের ২১ তারিখে একজন মানুষ মাছ ধরতে গিয়েছিলেন।";
if (!nur || momentLine(nur, "walk", "bn") !== nurLine) {
  throw new Error(`fishing countdown drifted: ${nur ? momentLine(nur, "walk", "bn") : "missing"}`);
}

const firoza = cases.find((row) => row.id === "firoza-begum-shibganj");
if (!firoza || !familyLine(firoza, "en").includes("Firoza Begum") || !firoza.url.includes("accidents-and-fires")) {
  throw new Error("firoza line or url");
}

const roadGov = kindSpan(cases, "road", "government");
if (!roadGov || roadGov.low !== 20000 || roadGov.high !== 500000) {
  throw new Error(`unexpected road government span ${JSON.stringify(roadGov)}`);
}

console.log(`ok ${cases.length} cases, draw ${drawIds.length}, does not recycle`);
