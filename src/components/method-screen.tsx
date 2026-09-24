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
  const { lang, theme, toggleLang, toggleTheme } = usePrefs();
  const counts = sceneCounts(cases);
  const filled = counts.filter((row) => row.total > 0);
  const empty = counts.filter((row) => row.total === 0);
  const bn = lang === "bn";

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={toggleTheme} nav="method" />
      <h1 className="name">{bn ? "অঙ্কটি সংবাদে যা আলোচিত হয়েছে" : "The figure is what a news article discussed"}</h1>
      <p className="lead">
        {bn
          ? "এই অঙ্ক একটি সংবাদ প্রতিবেদনে যা আলোচনা হয়েছে, সেটা। এটা আইনি পরামর্শ নয়, পূর্বাভাস নয়, এবং টাকা পাওয়া গেছে তার প্রমাণ নয়।"
          : "The figure is what a news article discussed, not legal advice, not a forecast, and not proof the money was received."}
      </p>
      <p className="lead">
        {bn
          ? "ব্যক্তিগত একটি অঙ্ক ফৌজদারি মামলার ফয়সালা নয়। বারিধারার প্রতিবেদনে অভিযুক্ত কিশোরকে এখানে দেখানো হয় না।"
          : "A private sum does not decide a criminal case. The accused teenager in the Baridhara reports is not shown."}
      </p>
      <p className="lead">
        {bn
          ? `এই ফাইলে ${toBnDigits(String(cases.length))}টি আলাদা মৃত্যু। একই মৃত্যু দুইবার নেই। খেলোয়াড় যে ঘটনা দেখেছেন, সেটি আবার আসে না।`
          : `This file has ${cases.length} distinct deaths. The same death is not entered twice. A case the player has seen does not return.`}
      </p>

      <h2 className="section">{bn ? "দৃশ্য" : "Scenes"}</h2>
      <ul className="counts">
        {filled.map((row) => (
          <li key={row.scene}>
            <strong>{sceneLabel[row.scene][lang]}</strong>
            <span>
              {bn
                ? ` ${toBnDigits(String(row.total))}টি, অঙ্ক আছে ${toBnDigits(String(row.withAmount))}টিতে, নেই ${toBnDigits(String(row.none))}টিতে`
                : ` ${row.total} cases, ${row.withAmount} with a discussed amount, ${row.none} with none`}
            </span>
          </li>
        ))}
      </ul>
      <p className="lead">
        {empty.length === 0
          ? bn
            ? "খালি দৃশ্য নেই। সড়ক, খোলা ড্রেন, কর্মস্থল, আগুন, নদী, রেল, এবং অবহেলা এই ফাইলে আছে।"
            : "No scene type in this file is empty. Road, open drain, workplace, fire, river, rail, and negligence are all present."
          : bn
            ? `যে দৃশ্যের কোনো প্রতিবেদন নেই, সেটি খেলায় আসে না: ${empty.map((row) => sceneLabel[row.scene].bn).join(", ")}।`
            : `Scenes with no coded article are not drawn: ${empty.map((row) => sceneLabel[row.scene].en).join(", ")}.`}
      </p>

      <h2 className="section">{bn ? "অঙ্কের ধরন" : "Kinds of amount"}</h2>
      <ul className="counts">
        {kinds.map((kind) => (
          <li key={kind}>{kindLabel[kind][lang]}</li>
        ))}
      </ul>
      <p className="lead">
        {bn ? "দুই ধরনের টাকা যোগ করে একটি অঙ্ক বানানো হয় না।" : "Two kinds of money are not added into one figure."}
      </p>
    </main>
  );
}
