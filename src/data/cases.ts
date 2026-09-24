import raw from "./cases.json";
import type { CaseRow } from "./types";

export const cases = raw as CaseRow[];

export function findCase(id: string): CaseRow | undefined {
  return cases.find((row) => row.id === id);
}
