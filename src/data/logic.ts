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
