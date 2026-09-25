import assert from "node:assert/strict";
import { momentLine } from "../src/data/moment";
import type { CaseRow } from "../src/data/types";
import { extractArticle } from "./extract-news";

const paid = extractArticle(
  "Ahidul Islam was killed in a road accident in Gazipur. The crash was in 2024. On 9 October 2025 his wife said she has received a cheque of Tk 5 lakh as compensation.",
);
assert.equal(paid.ok, true);
if (paid.ok) {
  assert.equal(paid.draft.amountBdt, 500000);
  assert.equal(paid.draft.paid, true);
  assert.equal(paid.draft.nameEn, "Ahidul Islam");
  assert.equal(paid.draft.scene, "road");
  assert.equal(paid.draft.actBn, "ছিলেন");
}

const promised = extractArticle(
  "Abul Kalam (৩৫) died on 26 October 2025 while walking on the footpath when a bearing pad fell. The adviser said compensation of Tk 5 lakh would be given to the family.",
);
assert.equal(promised.ok, true);
if (promised.ok) {
  assert.equal(promised.draft.paid, false);
  assert.equal(promised.draft.amountKind, "promised");
  assert.equal(promised.draft.scene, "neglect");
  assert.equal(promised.draft.nameEn, "Abul Kalam");
  assert.equal(promised.draft.age, 35);
  assert.equal(promised.draft.incidentDate, "2025-10-26");
  assert.equal(promised.draft.actEn, "was walking along a footpath");
}

const many = extractArticle(
  "Five people were killed in a road crash on 12 October 2022. Cheques of Tk 5 lakh and Tk 20 lakh were handed over as compensation on 22 October 2022.",
);
assert.equal(many.ok, false);

const minorAccused = extractArticle(
  "Karim Uddin was killed in a road accident on 2 January 2024. The driver, 17, is the accused. The family received a cheque of Tk 5 lakh as compensation.");
assert.equal(minorAccused.ok, false);
if (!minorAccused.ok) assert.match(minorAccused.reason, /under 18/);

const fiji = extractArticle(
  "Raihan Ali was killed in a road crash in Fiji on 27 June 2023. The Fiji government said it will pay Tk 40.5 lakh to his father. The money was not handed over.",
);
assert.equal(fiji.ok, false);
if (!fiji.ok) assert.match(fiji.reason, /outside Bangladesh/);

const unclear = extractArticle(
  "The High Court asked why Tk 1.5 crore in compensation should not be considered after a man died in a road crash on 4 March 2024.",
);
assert.equal(unclear.ok, false);

if (promised.ok) {
  const row: CaseRow = {
    id: "crawl-fixture",
    scene: promised.draft.scene,
    url: "https://example.com/story",
    outlet: "Prothom Alo",
    published: promised.draft.published,
    incidentDate: promised.draft.incidentDate,
    locationEn: "",
    locationBn: "",
    nameEn: promised.draft.nameEn,
    nameBn: promised.draft.nameBn,
    age: promised.draft.age,
    sex: "not_stated",
    doingEn: promised.draft.doingEn,
    doingBn: promised.draft.doingBn,
    actEn: promised.draft.actEn,
    actBn: promised.draft.actBn,
    othersDied: false,
    amountBdt: promised.draft.amountBdt,
    amountKind: promised.draft.amountKind,
    paid: promised.draft.paid,
    quoteEn: promised.draft.quoteEn,
    quoteBn: promised.draft.quoteBn,
    also: null,
    noteEn: null,
    noteBn: null,
    extraSources: [],
  };
  const line = momentLine(row, "walk", "bn");
  assert.match(line, /একজন মানুষ ফুটপাত দিয়ে চলছিলেন।/);
  assert.equal(line.includes("আবুল"), false);
}

console.log("extract ok");
