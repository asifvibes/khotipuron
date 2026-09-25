import type { AmountKind, CaseRow, Lang, SceneType } from "./types";

export const SEEN_KEY = "ordinary-seen-ids";
export const LANG_KEY = "ordinary-lang";
export const THEME_KEY = "khotipuron-theme";

const BN = "০১২৩৪৫৬৭৮৯";

export const sceneLabel: Record<SceneType, { bn: string; en: string }> = {
  road: { bn: "সড়ক", en: "Road" },
  open_drain: { bn: "খোলা ড্রেন", en: "Open drain" },
  workplace: { bn: "কর্মস্থল", en: "Workplace" },
  fire: { bn: "আগুন", en: "Fire" },
  river: { bn: "নদী", en: "River" },
  rail: { bn: "রেল", en: "Rail" },
  neglect: { bn: "অবহেলা", en: "Negligence" },
};

export const kindLabel: Record<AmountKind, { bn: string; en: string }> = {
  demanded: { bn: "দাবি", en: "demanded" },
  promised: { bn: "দেবে বলেছে", en: "promised" },
  said_handed: { bn: "দিয়েছে বলে খবর পাওয়া গেছে", en: "said handed over" },
  court: { bn: "আদালত", en: "court" },
  government: { bn: "সরকার", en: "government" },
  insurance: { bn: "বিমা", en: "insurance" },
  employer: { bn: "মালিক পক্ষ", en: "employer" },
  none: { bn: "ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি", en: "no compensation amount mentioned" },
};

export const NO_AMOUNT_BN = "ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।";
export const NO_AMOUNT_EN = "The article does not mention a compensation amount.";

/** Every collected case can be drawn. Paid amounts, then mentioned amounts, then the rest. */
export function inDraw(_row: CaseRow): boolean {
  return true;
}

/** 0 when an amount was paid or handed over, 1 when an amount is only mentioned, 2 when there is no amount. */
export function paymentRank(row: CaseRow): number {
  const hasAmount = row.amountBdt != null;
  const paid = row.paid === true ? 0 : 1;
  if (hasAmount && row.scene === "road") return paid;
  if (hasAmount && row.scene === "river") return 2 + paid;
  if (hasAmount) return 4 + paid;
  if (row.scene === "road") return 6;
  return 7;
}

export function toBnDigits(value: string): string {
  return value.replace(/\d/g, (digit) => BN[Number(digit)] ?? digit);
}

export function stakeLine(row: CaseRow, lang: Lang): string {
  if (row.amountBdt != null) {
    const taka = formatTaka(row.amountBdt, lang);
    if (lang === "bn") return `আপনি এভাবে মারা গেলে আপনার জীবনের মূল্য হবে ${taka}। খুব কম হয়ে গেল না? নাকি বেশি?`;
    return `If you died this way, your life's value would be ${taka}. Is that too little? Or too much?`;
  }
  const name = lang === "bn" ? row.nameBn : row.nameEn;
  if (lang === "bn") {
    const who = name ? `${name}-এর পরিবার` : "পরিবারটি";
    return `আপনি এভাবে মারা গেলে আপনার পরিবার মনে হয় না কোনো ক্ষতিপূরণ পাবে, কারণ ${who} কোনো টাকা পায়নি ক্ষতিপূরণ হিসেবে। হায়রে কপাল!`;
  }
  const who = name ? `${name}'s family` : "that family";
  return `If you died this way, your family does not seem likely to get any compensation, because ${who} received no money as compensation. What a fate.`;
}

export function collectedLine(total: number, read: number, lang: Lang): string {
  if (lang === "bn") {
    return `আমাদের কালেক্ট করা মোট ${toBnDigits(String(total))}টি খবরের মধ্যে আপনি পড়েছেন ${toBnDigits(String(read))}টি। কে জানে, আমাদের আশেপাশেই হয়তো লুকিয়ে আছে আরও কত অজানা খবর!`;
  }
  return `Of the ${total} stories we have collected, you have read ${read}, and who knows how many unknown stories may still be hidden around us.`;
}

const LAKH = 100_000;

export type AmountBucket = {
  id: string;
  labelBn: string;
  labelEn: string;
  count: number;
  totalBdt: number;
  /** More than half the people in this bucket are the one Magferat boat. */
  mostlyMagferat: boolean;
};

/**
 * Bands on the amounts actually in the file. Edges do not overlap.
 * Under 50 thousand, then under 1 lakh, then 1 to 5, 5 to 10, above 10.
 * 5 lakh starts the fourth bar. 10 lakh stays in that bar.
 * Above 10 lakh is strictly more than 10 lakh.
 * The page omits a band whose count is 0.
 */
const AMOUNT_BANDS: { id: string; labelBn: string; labelEn: string; test: (amount: number) => boolean }[] = [
  { id: "under-50", labelBn: "৫০ হাজারেরও কম", labelEn: "Under 50 thousand", test: (amount) => amount < 50_000 },
  {
    id: "under-1",
    labelBn: "১ লাখের কম",
    labelEn: "Under 1 lakh",
    test: (amount) => amount >= 50_000 && amount < LAKH,
  },
  {
    id: "1-to-5",
    labelBn: "১ থেকে ৫ লাখ",
    labelEn: "1 to 5 lakh",
    test: (amount) => amount >= LAKH && amount < 5 * LAKH,
  },
  {
    id: "5-to-10",
    labelBn: "৫ থেকে ১০ লাখ",
    labelEn: "5 to 10 lakh",
    test: (amount) => amount >= 5 * LAKH && amount <= 10 * LAKH,
  },
  { id: "above-10", labelBn: "১০ লাখের বেশি", labelEn: "Above 10 lakh", test: (amount) => amount > 10 * LAKH },
];

export function amountRanges(rows: CaseRow[]): { buckets: AmountBucket[]; people: number; totalBdt: number } {
  const withAmount = rows.filter(
    (row): row is CaseRow & { amountBdt: number } => typeof row.amountBdt === "number" && Number.isFinite(row.amountBdt),
  );
  const buckets = AMOUNT_BANDS.map((band) => {
    const group = withAmount.filter((row) => band.test(row.amountBdt));
    const magferat = group.filter((row) => row.id.includes("magferat")).length;
    return {
      id: band.id,
      labelBn: band.labelBn,
      labelEn: band.labelEn,
      count: group.length,
      totalBdt: group.reduce((sum, row) => sum + row.amountBdt, 0),
      mostlyMagferat: group.length > 0 && magferat * 2 > group.length,
    };
  });
  return {
    buckets,
    people: withAmount.length,
    totalBdt: withAmount.reduce((sum, row) => sum + row.amountBdt, 0),
  };
}

export function formatTaka(amount: number, lang: Lang): string {
  const grouped = amount.toLocaleString("en-IN");
  if (lang === "en") return `Tk ${grouped}`;
  return `${toBnDigits(grouped)} টাকা`;
}

export function articleYear(published: string): string {
  return published.slice(0, 4);
}

export function pickUnseen(
  rows: CaseRow[],
  seen: ReadonlySet<string>,
  random: () => number = Math.random,
): CaseRow | null {
  const unseen = rows.filter((row) => inDraw(row) && !seen.has(row.id));
  if (unseen.length === 0) return null;
  const best = Math.min(...unseen.map(paymentRank));
  const pool = unseen.filter((row) => paymentRank(row) === best);
  const scenes = [...new Set(pool.map((row) => row.scene))];
  const scene = scenes[Math.floor(random() * scenes.length)];
  const group = pool.filter((row) => row.scene === scene);
  return group[Math.floor(random() * group.length)] ?? null;
}

const MONTHS_BN = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatDate(iso: string, lang: Lang): string {
  const [year, month, day] = iso.split("-");
  const monthIndex = Number(month) - 1;
  if (lang === "bn") {
    return `${toBnDigits(String(Number(day)))} ${MONTHS_BN[monthIndex]} ${toBnDigits(year)}`;
  }
  return `${Number(day)} ${MONTHS_EN[monthIndex]} ${year}`;
}

export function countdownDate(iso: string, lang: Lang): string {
  const [year, month, day] = iso.split("-");
  const monthIndex = Number(month) - 1;
  if (lang === "bn") {
    return `${toBnDigits(year)} সালের ${MONTHS_BN[monthIndex]} মাসের ${toBnDigits(String(Number(day)))} তারিখে`;
  }
    return `On ${Number(day)} ${MONTHS_EN[monthIndex]} ${year}`;
}

export function dateLine(row: CaseRow, lang: Lang): string {
  if (row.incidentDate) {
    const date = formatDate(row.incidentDate, lang);
    return lang === "bn" ? `ঘটনাটা ঘটেছে ${date}।` : `The incident happened on ${date}.`;
  }
  const date = formatDate(row.published, lang);
  return lang === "bn" ? `এটা খবরের তারিখ, ${date}।` : `This is the report date, ${date}.`;
}

const deathBn: Record<SceneType, string> = {
  road: "সড়ক দুর্ঘটনায় তিনি মারা গেছেন।",
  open_drain: "খোলা ড্রেনে পড়ে তিনি মারা গেছেন।",
  workplace: "কর্মস্থলে দুর্ঘটনায় তিনি মারা গেছেন।",
  fire: "আগুনে তিনি মারা গেছেন।",
  river: "নদীতে তিনি মারা গেছেন।",
  rail: "রেল দুর্ঘটনায় তিনি মারা গেছেন।",
  neglect: "অবহেলায় তিনি মারা গেছেন।",
};

const deathEn: Record<SceneType, string> = {
  road: "The person died in a road crash.",
  open_drain: "The person died after falling into an open drain.",
  workplace: "The person died in a workplace accident.",
  fire: "The person died in a fire.",
  river: "The person died in the river.",
  rail: "The person died in a rail crash.",
  neglect: "The person died in an incident of negligence.",
};

export function deathLine(scene: SceneType, lang: Lang): string {
  return lang === "bn" ? deathBn[scene] : deathEn[scene];
}

export function sceneSentence(scene: SceneType, lang: Lang): string {
  const bn: Record<SceneType, string> = {
    road: "এটা একটা সড়ক দুর্ঘটনা।",
    open_drain: "এটা খোলা ড্রেনের একটা ঘটনা।",
    workplace: "এটা কর্মস্থলের একটা দুর্ঘটনা।",
    fire: "এটা আগুনের একটা ঘটনা।",
    river: "এটা নদীর একটা ঘটনা।",
    rail: "এটা একটা রেল দুর্ঘটনা।",
    neglect: "এটা অবহেলার একটা ঘটনা।",
  };
  const en: Record<SceneType, string> = {
    road: "This was a road crash.",
    open_drain: "This was an open-drain incident.",
    workplace: "This was a workplace accident.",
    fire: "This was a fire.",
    river: "This was a river incident.",
    rail: "This was a rail crash.",
    neglect: "This was a case of negligence.",
  };
  return lang === "bn" ? bn[scene] : en[scene];
}

export function kindSpan(
  rows: CaseRow[],
  scene: SceneType,
  kind: AmountKind,
): { low: number; high: number } | null {
  const amounts = rows
    .filter((row) => row.scene === scene && row.amountKind === kind && row.amountBdt != null)
    .map((row) => row.amountBdt as number);
  if (amounts.length < 2) return null;
  return { low: Math.min(...amounts), high: Math.max(...amounts) };
}

export const PUBLIC_ORIGIN = "https://khotipuron.com";

const DIGIT = /[0-9০-৯]/;

export function hasDigit(value: string): boolean {
  return DIGIT.test(value);
}

export function publicCaseUrl(id: string): string {
  return `${PUBLIC_ORIGIN}/c/${id}`;
}

export function discussedY(row: CaseRow, lang: Lang): string | null {
  if (row.amountBdt == null) return null;
  return formatTaka(row.amountBdt, lang);
}

/** Kind and paid-or-not, kept off the family line so that sentence stays as written. */
export function moneyLine(row: CaseRow, lang: Lang): string | null {
  if (row.amountBdt == null || row.amountKind === "none") return null;
  const kind = kindLabel[row.amountKind];
  if (lang === "bn") {
    const paid = row.paid === true ? "টাকা দেয়া হয়েছে বলে খবর।" : "পেইড বলা নেই।";
    const second = row.also ? ` আরেক এমাউন্টের ধরন: ${kindLabel[row.also.amountKind].bn}।` : "";
    return `${paid} এমাউন্টের ধরন: ${kind.bn}।${second}`;
  }
  const paid =
    row.paid === true
      ? "The article says the money was handed over."
      : "The article does not say this was paid.";
  const second = row.also ? ` The other amount's kind: ${kindLabel[row.also.amountKind].en}.` : "";
  return `${paid} Kind: ${kind.en}.${second}`;
}

export function familyLine(row: CaseRow, lang: Lang): string {
  if (row.amountBdt == null) return lang === "bn" ? NO_AMOUNT_BN : NO_AMOUNT_EN;
  const name = lang === "bn" ? row.nameBn : row.nameEn;
  const taka = formatTaka(row.amountBdt, lang);
  if (lang === "bn") {
    const family = name
      ? `${name}-এর পরিবারের জন্য এই টাকাই দেয়া হবে বলে খবর।`
      : "এই পরিবারের জন্য এই টাকাই দেয়া হবে বলে খবর।";
    return `এই ধরনের ঘটনায় কেউ মারা গেলে পরিবার ${taka} পেতে পারে। খবরে এই এমাউন্টই আছে। ${family}`;
  }
  const family = name
    ? `The article says this sum would be given for ${name}'s family.`
    : "The article says this sum would be given for the family in this report.";
  return `If someone died in an incident like this, the family may get ${taka}. The article states this amount. ${family}`;
}

export function shareText(row: CaseRow, lang: Lang): string {
  const scene = sceneSentence(row.scene, lang);
  const y = discussedY(row, lang);
  if (lang === "bn") {
    const amount = y ? `খবরে ক্ষতিপূরণ ${y}।` : NO_AMOUNT_BN;
    return `${scene} ${amount} ক্ষতিপূরণ খেলুন।`;
  }
  const amount = y ? `The article discussed ${y}.` : NO_AMOUNT_EN;
  return `${scene} ${amount} Try Khotipuron.`;
}

export function ogTitle(row: CaseRow): string {
  const y = discussedY(row, "bn");
  const scene = sceneSentence(row.scene, "bn");
  if (!y) return `${scene} ${NO_AMOUNT_BN}`;
  return `${scene} ${y}`;
}

export function ogDescription(row: CaseRow): string {
  const y = discussedY(row, "bn");
  const scene = sceneSentence(row.scene, "bn");
  if (!y) return `${scene} ${NO_AMOUNT_BN} ক্ষতিপূরণ খেলুন।`;
  return `${scene} খবরে ক্ষতিপূরণ ${y}। ক্ষতিপূরণ খেলুন।`;
}

export function safeText(row: CaseRow, text: string | null): string | null {
  if (!text) return null;
  if (row.amountBdt == null && hasDigit(text)) return null;
  return text;
}

export function incidentSummary(row: CaseRow, lang: Lang): string {
  const name = safeText(row, lang === "bn" ? row.nameBn : row.nameEn);
  const doing = safeText(row, lang === "bn" ? row.doingBn : row.doingEn);
  const placeRaw = (lang === "bn" ? row.locationBn : row.locationEn).trim();
  const place = placeRaw.length > 0 ? placeRaw : null;
  const age =
    row.age != null ? (lang === "bn" ? `${toBnDigits(String(row.age))} বছর` : String(row.age)) : null;
  const sentences: string[] = [];
  if (lang === "bn") {
    if (doing) {
      const act = doing.trim().replace(/।$/, "");
      const hasSubject = /তিনি|খবরে|পুলিশ|নাম/.test(act);
      if (name && hasSubject) sentences.push(`${age ? `${name}, বয়স ${age}` : name}। ${act}।`);
      else if (name) sentences.push(`${age ? `${name}, বয়স ${age},` : name} ${act}।`);
      else sentences.push(`${hasSubject ? act : `তিনি ${act}`}।`);
    } else if (name) {
      sentences.push(`${name}${age ? `, বয়স ${age}` : ""}।`);
    }
    if (place) sentences.push(`খবরে ঘটনাস্থল ${place}।`);
    return sentences.join(" ");
  }
  if (doing) {
    const act = doing.trim().replace(/\.$/, "");
    const who = name ? (age ? `${name}, ${age},` : name) : null;
    const first = act.split(/[\s,.]/)[0] ?? "";
    const lower = `${act.charAt(0).toLowerCase()}${act.slice(1)}`;
    const startsFull = /^(the |police |he |she )/i.test(act);
    if (who && startsFull) sentences.push(`${who.replace(/,$/, "")}. ${act}.`);
    else if (who && /ing$/i.test(first)) sentences.push(`${who} was ${lower}.`);
    else if (who && /^(in|on|at|from|after|while)$/i.test(first)) sentences.push(`${who} was ${lower}.`);
    else if (who && /ed$/i.test(first)) sentences.push(`${who} ${lower}.`);
    else if (who) sentences.push(`${who} was a ${lower}.`);
    else sentences.push(`${act}.`);
  } else if (name) {
    sentences.push(age ? `${name}, ${age}.` : `${name}.`);
  }
  if (place) sentences.push(`The article says this happened at ${place}.`);
  return sentences.join(" ");
}

export function portraitOf(row: CaseRow): { url: string; creditEn: string; creditBn: string } | null {
  const image = row.image;
  if (!image?.url || !image.articlePicturesVictim) return null;
  const named = Boolean(row.nameEn || row.nameBn);
  if (row.age != null && row.age < 18 && !named) return null;
  return image;
}

export function inDhakaCity(row: CaseRow): boolean {
  const cleaned = (row.locationEn ?? "").replace(/Dhaka-[A-Za-z]+/g, "");
  return /\bDhaka\b/.test(cleaned);
}

/** Incident year, or the report year when the article gives no incident date. */
export function collectedYearSpan(rows: CaseRow[]): { from: number; to: number } | null {
  const years = rows.flatMap((row) => {
    const iso = row.incidentDate || row.published;
    const year = Number(iso.slice(0, 4));
    return Number.isFinite(year) && year > 0 ? [year] : [];
  });
  if (years.length === 0) return null;
  return { from: Math.min(...years), to: Math.max(...years) };
}

export function paymentBars(rows: CaseRow[]) {
  const rate = (group: CaseRow[]) => {
    const paid = group.filter((row) => row.paid === true).length;
    return { paid, total: group.length, pct: group.length ? Math.round((paid / group.length) * 100) : 0 };
  };
  const outside = rows.filter((row) => !inDhakaCity(row));
  return {
    dhaka: rate(rows.filter(inDhakaCity)),
    outside: rate(outside),
    outsideNoBoat: rate(outside.filter((row) => !row.id.includes("magferat"))),
  };
}

export function settlementLines(rows: CaseRow[], lang: Lang): string[] {
  const paid = rows.filter((row) => row.paid === true);
  const mentioned = rows.filter((row) => row.amountBdt != null && row.paid !== true);
  const none = rows.length - paid.length - mentioned.length;
  const dhaka = rows.filter(inDhakaCity);
  const outside = rows.filter((row) => !inDhakaCity(row));
  const dhakaPaid = dhaka.filter((row) => row.paid === true).length;
  const outsidePaid = outside.filter((row) => row.paid === true).length;
  const boat = paid.filter((row) => row.id.includes("magferat"));
  const outsideWithoutBoat = outside.filter((row) => !row.id.includes("magferat"));
  const outsidePaidWithoutBoat = outsideWithoutBoat.filter((row) => row.paid === true).length;
  const women = rows.filter((row) => row.sex === "female");
  const men = rows.filter((row) => row.sex === "male");
  const womenPaid = women.filter((row) => row.paid === true).length;
  const menPaid = men.filter((row) => row.paid === true).length;
  const road = rows.filter((row) => row.scene === "road");
  const roadPaid = road.filter((row) => row.paid === true).length;
  const riverPaid = rows.filter((row) => row.scene === "river" && row.paid === true).length;
  const menBoat = boat.filter((row) => row.sex === "male").length;
  const quietScenes = (["open_drain", "fire", "rail"] as SceneType[]).filter(
    (scene) => !rows.some((row) => row.scene === scene && row.paid === true),
  );

  const bn = (value: number) => toBnDigits(String(value));
  if (lang === "bn") {
    const lines = [
      `মোট ${bn(rows.length)}টা খবর। ${bn(paid.length)}টাতে ক্ষতিপূরণের টাকা দেয়া হয়েছে বলে নিউজ আর্টিকেলগুলোয়। ${bn(mentioned.length)}টাতে স্পেসিফিক এমাউন্ট আছে, তবে সেটা পেইড কি না তা বলা নেই। বাকি ${bn(none)}টাতে কোনো এমাউন্টই নেই।`,
      `ঢাকায় ${bn(dhaka.length)}টা কেস, পেইড ${bn(dhakaPaid)}টা। ঢাকার বাইরে ${bn(outside.length)}টা কেস, পেইড ${bn(outsidePaid)}টা।`,
      `বাইরের ক্ষতিপূরণের ${bn(boat.length)}টা নিউজ একই বোট এক্সিডেন্টের। কর্ণফুলীতে এফভি ম্যাগফেরাত ডুবেছিল, একদিনে ক্রুদের ফ্যামিলিকে টাকা দেয়। ওই কেস বাদ দিলে বাইরে ${bn(outsideWithoutBoat.length)}টার মধ্যে পেইড মাত্র ${bn(outsidePaidWithoutBoat)}টা।`,
      `মহিলা ${bn(women.length)} জনের মধ্যে পেইড ${bn(womenPaid)} জন। পুরুষ ${bn(men.length)} জনের মধ্যে পেইড ${bn(menPaid)} জন, তার ${bn(menBoat)} জন ওই বোটের। ক্রুদের বেশির ভাগের বয়স খবরে নেই, তাই বয়স দিয়ে রেট বলা যাচ্ছে না।`,
      `রোডে ${bn(road.length)}টার মধ্যে পেইড ${bn(roadPaid)}টা। নদীতে ডুবে মারা যাওয়ার ঘটনায় যত পেইড, সব ওই এক বোট এক্সিডেন্টের।`,
    ];
    if (quietScenes.length) {
      const names = quietScenes.map((scene) => sceneLabel[scene].bn).join(", ");
      lines.push("ড্রেন, ফায়ার আর রেলের খবরে আপাতত কোনো ক্ষতিপূরণের নিউজ আমাদের জানা নেই।");
      lines.push(`সেকশন: ${names}।`);
    }
    lines.push("ঢাকা মানে খবরে ঘটনাস্থল ঢাকা শহর। ঢাকা-সিলেট হাইওয়ে যদি সিলেটে হয়, সেটা ঢাকার বাইরে। এটা দেশের সব ডেথ না, শুধু এখানে আমাদের ওয়েবসাইটে যত খবর আছে।");
    return lines;
  }

  const lines = [
    `Of these ${rows.length} stories, ${paid.length} say the money was handed over. ${mentioned.length} name an amount but do not say it was paid. The other ${none} name no amount.`,
    `Inside Dhaka city: ${dhaka.length} deaths, ${dhakaPaid} with money handed over. Outside Dhaka: ${outside.length} deaths, ${outsidePaid} with money handed over.`,
    `${boat.length} of those ${outsidePaid} outside payments are one boat. FV Magferat sank on the Karnaphuli, and the crew's families were paid on one day. Without that story, ${outsidePaidWithoutBoat} of ${outsideWithoutBoat.length} deaths outside Dhaka say money was handed over.`,
    `${womenPaid} of ${women.length} women, and ${menPaid} of ${men.length} men, are reported as paid. ${menBoat} of the men were on that boat. Most of the crew's ages are not in the articles, so a rate by age cannot be stated.`,
    `${roadPaid} of ${road.length} road deaths say money was handed over. All ${riverPaid} paid river stories are that one boat.`,
  ];
  if (quietScenes.length) {
    lines.push(`In this file, open drain, fire, and rail name no payment. Those sections: ${quietScenes.map((scene) => sceneLabel[scene].en).join(", ")}.`);
  }
  lines.push("Dhaka means the article places the death in Dhaka city. A highway named Dhaka in another district counts as outside. This is only the stories collected here, not every death in the country.");
  return lines;
}

export function sceneCounts(rows: CaseRow[]) {
  const scenes = Object.keys(sceneLabel) as SceneType[];
  return scenes.map((scene) => {
    const group = rows.filter((row) => row.scene === scene);
    const withAmount = group.filter((row) => row.amountBdt != null).length;
    return {
      scene,
      total: group.length,
      withAmount,
      none: group.length - withAmount,
    };
  });
}
