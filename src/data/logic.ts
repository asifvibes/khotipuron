import type { AmountKind, CaseRow, Lang, SceneType } from "./types";

export const SEEN_KEY = "ordinary-seen-ids";
export const LANG_KEY = "ordinary-lang";

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
  promised: { bn: "প্রতিশ্রুত", en: "promised" },
  said_handed: { bn: "হস্তান্তর হয়েছে বলে বলা হয়েছে", en: "said to be handed over" },
  court: { bn: "আদালত", en: "court" },
  government: { bn: "সরকার", en: "government" },
  insurance: { bn: "বিমা", en: "insurance" },
  employer: { bn: "নিয়োগকর্তা", en: "employer" },
  none: { bn: "উল্লেখ নেই", en: "none mentioned" },
};

export function toBnDigits(value: string): string {
  return value.replace(/\d/g, (digit) => BN[Number(digit)] ?? digit);
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
  const unseen = rows.filter((row) => !seen.has(row.id));
  if (unseen.length === 0) return null;
  const scenes = [...new Set(unseen.map((row) => row.scene))];
  const scene = scenes[Math.floor(random() * scenes.length)];
  const pool = unseen.filter((row) => row.scene === scene);
  return pool[Math.floor(random() * pool.length)] ?? null;
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
  return `${formatTaka(row.amountBdt, lang)}, ${kindLabel[row.amountKind][lang]}`;
}

export function familyLine(row: CaseRow, lang: Lang): string {
  const y = discussedY(row, lang);
  if (!y) {
    return lang === "bn"
      ? "কোনো ক্ষতিপূরণের অঙ্ক আলোচিত হয়নি।"
      : "No Khotipuron amount was discussed.";
  }
  const name = lang === "bn" ? row.nameBn : row.nameEn;
  if (lang === "bn") {
    const because = name
      ? `কারণ ${name}-এর পরিবারের জন্য এই অঙ্ক আলোচিত হয়েছিল।`
      : "কারণ এই প্রতিবেদনে একটি পরিবারের জন্য এই অঙ্ক আলোচিত হয়েছিল।";
    return `আপনি এই ধরনের ঘটনায় মারা গেলে, আপনার পরিবার ক্ষতিপূরণ হিসেবে ${y} পেতে পারে, ${because}`;
  }
  const because = name
    ? `because ${name}'s family had this amount discussed.`
    : "because the family in this report had this amount discussed.";
  return `If you died in this kind of incident, your family may get ${y} as Khotipuron, ${because}`;
}

export function shareText(row: CaseRow, lang: Lang): string {
  const scene = sceneLabel[row.scene][lang];
  const y = discussedY(row, lang);
  if (lang === "bn") {
    const amount = y ? `আলোচিত ক্ষতিপূরণ: ${y}।` : "কোনো ক্ষতিপূরণের অঙ্ক আলোচিত হয়নি।";
    return `${scene}। ${amount} খেলে দেখুন, Khotipuron / ক্ষতিপূরণ।`;
  }
  const amount = y ? `Discussed Khotipuron: ${y}.` : "No Khotipuron amount was discussed.";
  return `${scene}. ${amount} Try Khotipuron / ক্ষতিপূরণ.`;
}

export function ogTitle(row: CaseRow): string {
  const y = discussedY(row, "bn");
  const scene = sceneLabel[row.scene].bn;
  if (!y) return `${scene} · কোনো ক্ষতিপূরণের অঙ্ক আলোচিত হয়নি`;
  return `${scene} · ${y}`;
}

export function ogDescription(row: CaseRow): string {
  const y = discussedY(row, "bn");
  if (!y) {
    return "কোনো ক্ষতিপূরণের অঙ্ক আলোচিত হয়নি। খেলে দেখুন, Khotipuron / ক্ষতিপূরণ। No Khotipuron amount was discussed.";
  }
  const en = discussedY(row, "en");
  return `${sceneLabel[row.scene].bn}। আলোচিত ক্ষতিপূরণ: ${y}। খেলে দেখুন, Khotipuron / ক্ষতিপূরণ। Discussed Khotipuron: ${en}.`;
}

export function safeText(row: CaseRow, text: string | null): string | null {
  if (!text) return null;
  if (row.amountBdt == null && hasDigit(text)) return null;
  return text;
}

export function incidentSummary(row: CaseRow, lang: Lang): string {
  const name = safeText(row, lang === "bn" ? row.nameBn : row.nameEn);
  const doing = safeText(row, lang === "bn" ? row.doingBn : row.doingEn);
  const place = safeText(row, lang === "bn" ? row.locationBn : row.locationEn);
  const bits: string[] = [];
  if (name) bits.push(name);
  if (row.amountBdt != null && row.age != null) {
    bits.push(lang === "bn" ? `${toBnDigits(String(row.age))} বছর` : String(row.age));
  }
  const stop = lang === "bn" ? "।" : ".";
  const sentences = [bits.join(", "), doing, place].filter((part): part is string => Boolean(part));
  if (sentences.length === 0) return "";
  return sentences.map((part) => part.replace(/[।.]$/, "")).join(`${stop} `) + stop;
}

export function portraitOf(row: CaseRow): { url: string; creditEn: string; creditBn: string } | null {
  const image = row.image;
  if (!image?.url || !image.articlePicturesVictim) return null;
  const named = Boolean(row.nameEn || row.nameBn);
  if (row.age != null && row.age < 18 && !named) return null;
  return image;
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
