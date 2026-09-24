import { cases } from "../src/data/cases";
import { kindSpan, pickUnseen } from "../src/data/logic";

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

const roadGov = kindSpan(cases, "road", "government");
if (!roadGov || roadGov.low !== 20000 || roadGov.high !== 25000) {
  throw new Error(`unexpected road government span ${JSON.stringify(roadGov)}`);
}

console.log(`ok ${cases.length} cases, draw does not recycle`);
