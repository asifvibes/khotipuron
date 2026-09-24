"use client";

import { cases } from "@/data/cases";
import { kindLabel, sceneCounts, sceneLabel, toBnDigits } from "@/data/logic";
import { TopBar, usePrefs } from "@/components/prefs";
import type { AmountKind } from "@/data/types";

const kinds: AmountKind[] = [
  "demanded",
  "promised",
  "said_handed",
  "court",
  "government",
  "insurance",
  "employer",
  "none",
];

export function MethodScreen() {
  const { lang, theme, toggleLang, chooseTheme } = usePrefs();
  const counts = sceneCounts(cases);
  const filled = counts.filter((row) => row.total > 0);
  const empty = counts.filter((row) => row.total === 0);
  const bn = lang === "bn";
  const total = bn ? toBnDigits(String(cases.length)) : String(cases.length);

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={chooseTheme} nav="method" />
      <h1 className="name">{bn ? "টাকাটা খবর থেকে" : "The money is from the news"}</h1>
      <p className="lead">{bn ? "এটা খবরে যা লেখা।" : "This is what the news wrote."}</p>
      <p className="lead">{bn ? "উকিলের পরামর্শ নয়।" : "Not a lawyer's advice."}</p>
      <p className="lead">{bn ? "কত টাকা পাবেন, তা এখানে বলা নেই।" : "Not a forecast."}</p>
      <p className="lead">{bn ? "টাকা পেয়েছেন কি না, তার প্রমাণ নয়।" : "Not proof the money was received."}</p>
      <p className="lead">{bn ? "এই টাকা মামলা শেষ করে না।" : "This money does not end the case."}</p>
      <p className="lead">
        {bn
          ? "বারিধারার খবরে অভিযুক্ত কিশোরের নাম এখানে নেই।"
          : "The Baridhara report's accused teenager is not named here."}
      </p>
      <p className="lead">{bn ? `এই ফাইলে ${total}টি আলাদা মৃত্যু।` : `This file has ${total} separate deaths.`}</p>
      <p className="lead">{bn ? "এক মৃত্যু দুবার নেই।" : "The same death is not listed twice."}</p>
      <p className="lead">
        {bn ? "যে খবর দেখা হয়েছে, সেটা আর আসে না।" : "A story you have seen does not come back."}
      </p>

      <h2 className="section">{bn ? "দৃশ্য" : "Scenes"}</h2>
      <ul className="counts">
        {filled.map((row) => (
          <li key={row.scene}>
            <strong>{sceneLabel[row.scene][lang]}</strong>
            <span>
              {bn
                ? ` ${toBnDigits(String(row.total))}টি। টাকার কথা আছে ${toBnDigits(String(row.withAmount))}টিতে। নেই ${toBnDigits(String(row.none))}টিতে।`
                : ` ${row.total}. A sum in ${row.withAmount}. No sum in ${row.none}.`}
            </span>
          </li>
        ))}
      </ul>
      {empty.length === 0 ? (
        <>
          <p className="lead">{bn ? "কোনো দৃশ্য খালি নেই।" : "No scene is empty."}</p>
          <p className="lead">
            {bn
              ? "সড়ক, খোলা ড্রেন, কর্মস্থল, আগুন, নদী, রেল, অবহেলা সব আছে।"
              : "Road, open drain, workplace, fire, river, rail, and negligence are all here."}
          </p>
        </>
      ) : (
        <p className="lead">
          {bn
            ? `যে দৃশ্যে খবর নেই, সেটা খেলায় আসে না: ${empty.map((row) => sceneLabel[row.scene].bn).join(", ")}।`
            : `A scene with no story is not drawn: ${empty.map((row) => sceneLabel[row.scene].en).join(", ")}.`}
        </p>
      )}

      <h2 className="section">{bn ? "টাকার ধরন" : "Kinds of money"}</h2>
      <ul className="counts">
        {kinds.map((kind) => (
          <li key={kind}>{kindLabel[kind][lang]}</li>
        ))}
      </ul>
      <p className="lead">{bn ? "দুই রকম টাকা যোগ করা হয় না।" : "Two kinds of money are not added together."}</p>
    </main>
  );
}
