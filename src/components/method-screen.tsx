"use client";

import { cases } from "@/data/cases";
import { inDraw, kindLabel, sceneCounts, sceneLabel, toBnDigits } from "@/data/logic";
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
  const drawn = cases.filter(inDraw);
  const drawnMoney = drawn.filter((row) => row.amountBdt != null).length;
  const drawnText = bn ? toBnDigits(String(drawn.length)) : String(drawn.length);
  const moneyText = bn ? toBnDigits(String(drawnMoney)) : String(drawnMoney);

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={chooseTheme} nav="method" />
      <h1 className="name">{bn ? "এই টাকা খবর থেকে নেওয়া।" : "This money is taken from the news."}</h1>
      <p className="lead">{bn ? "এখানে যা লেখা, তা ওই খবর থেকে নেওয়া।" : "What is written here is taken from that article."}</p>
      <p className="lead">{bn ? "এটি উকিলের পরামর্শ নয়।" : "This is not a lawyer's advice."}</p>
      <p className="lead">{bn ? "কত টাকা পাবেন, তা এখানে বলা হয়নি।" : "This does not say how much you would receive."}</p>
      <p className="lead">{bn ? "টাকা হাতে পেয়েছেন কি না, তার প্রমাণ এটা নয়।" : "This is not proof the money was received."}</p>
      <p className="lead">{bn ? "এই টাকা মামলা শেষ করে না।" : "This money does not end the case."}</p>
      <p className="lead">
        {bn
          ? "বারিধারার খবরে অভিযুক্ত কিশোরের নাম এখানে নেই।"
          : "The Baridhara report's accused teenager is not named here."}
      </p>
      <p className="lead">{bn ? `এই ফাইলে ${total}টি আলাদা মৃত্যু আছে।` : `This file has ${total} separate deaths.`}</p>
      <p className="lead">{bn ? "একই মৃত্যু দুবার লেখা নেই।" : "The same death is not listed twice."}</p>
      <p className="lead">
        {bn
          ? `খেলায় ${drawnText}টি খবর আসে। এর মধ্যে ${moneyText}টিতে টাকার এমাউন্ট আছে।`
          : `The game draws ${drawnText} stories. ${moneyText} of them state a compensation amount.`}
      </p>
      <p className="lead">
        {bn
          ? "যে খবরে এমাউন্ট নেই, তার বেশির ভাগ ফাইলে থাকে, খেলায় আসে না।"
          : "Most stories that do not state an amount stay in the file and are not drawn."}
      </p>
      <p className="lead">
        {bn ? "যে খবর একবার দেখা হয়েছে, সেটি আর আসে না।" : "A story you have seen does not come back."}
      </p>

      <h2 className="section">{bn ? "দৃশ্য" : "Scenes"}</h2>
      <ul className="counts">
        {filled.map((row) => (
          <li key={row.scene}>
            <strong>{sceneLabel[row.scene][lang]}</strong>
            <span>
              {bn
                ? ` ${toBnDigits(String(row.total))}টি ঘটনা আছে। ${toBnDigits(String(row.withAmount))}টিতে টাকার এমাউন্ট লেখা আছে। ${toBnDigits(String(row.none))}টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।`
                : ` There are ${row.total} cases. ${row.withAmount} state a compensation amount. The article does not mention a compensation amount in ${row.none}.`}
            </span>
          </li>
        ))}
      </ul>
      {empty.length === 0 ? (
        <>
          <p className="lead">{bn ? "কোনো দৃশ্য খালি নেই।" : "No scene in this file is empty."}</p>
          <p className="lead">
            {bn
              ? "সড়ক, খোলা ড্রেন, কর্মস্থল, আগুন, নদী, রেল এবং অবহেলা এই ফাইলে আছে।"
              : "Road, open drain, workplace, fire, river, rail, and negligence are all in this file."}
          </p>
        </>
      ) : (
        <p className="lead">
          {bn
            ? `যে দৃশ্যে খবর নেই, সেটি খেলায় আসে না: ${empty.map((row) => sceneLabel[row.scene].bn).join(", ")}।`
            : `A scene with no story is not drawn: ${empty.map((row) => sceneLabel[row.scene].en).join(", ")}.`}
        </p>
      )}

      <h2 className="section">{bn ? "টাকার ধরন" : "Kinds of money"}</h2>
      <ul className="counts">
        {kinds.map((kind) => (
          <li key={kind}>{kindLabel[kind][lang]}</li>
        ))}
      </ul>
      <p className="lead">
        {bn ? "দুই রকম টাকা যোগ করে একটি সংখ্যা বানানো হয় না।" : "Two kinds of money are not added into one sum."}
      </p>
    </main>
  );
}
