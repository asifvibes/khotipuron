import raw from "./cases.json";
import type { CaseRow } from "./types";

// Deaths outside Bangladesh are not collected. scripts/check-cases.ts rejects that location.
export const cases = raw as CaseRow[];

export function findCase(id: string): CaseRow | undefined {
  return cases.find((row) => row.id === id);
}
