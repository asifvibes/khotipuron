"use client";

import { TopBar, usePrefs } from "@/components/prefs";
import { cases } from "@/data/cases";
import { sceneCounts, sceneLabel, settlementLines, toBnDigits } from "@/data/logic";
import type { Lang } from "@/data/types";

const FACEBOOK = "https://www.facebook.com/khotipuronUpdate/";

const BN = {
  intro:
    "এই ক্ষতিপূরণের টাকার এমাউন্টের তথ্য বিভিন্ন নিউজ পোর্টাল থেকে নেয়া হয়েছে। নিউজের লিংক ঘটনার বিস্তারিত ইনফোর সাথেই দেয়া আছে।",
  advice: "এটি উকিলের পরামর্শ নয়।",
  receive: "কত টাকা পাবেন, তা এখানে বলা হয়নি।",
  proof: "টাকা হাতে পেয়েছেন কি না, তার প্রমাণ এটা নয়।",
  case: "এই টাকা মামলা শেষ করে না।",
  summary: "সামারিঃ",
  sections:
    "সড়ক, খোলা ড্রেন, কর্মস্থল, আগুন, নদী, রেল এবং অবহেলা এই কয়টা সেকশন আপাতত এড করা আছে, ফিউচারে আরও এড করা যেতে পারে।",
  settlement: "টাকা দেওয়ার খবরঃ",
  kindsLabel: "টাকার ধরনঃ",
  kinds: [
    "দাবি",
    "দেবে বলেছে",
    "দিয়েছে বলে খবর পাওয়া গেছে",
    "আদালত",
    "সরকার",
    "বিমা",
    "মালিক পক্ষ",
    "ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি",
  ],
  feedback: "এই ওয়েবসাইট নিয়ে কোনো সাজেশন বা ফিডব্যাক থাকলে আমাদের ফেসবুক পেইজে জানানঃ",
};

const EN = {
  intro:
    "The compensation amounts here are taken from different news portals. The news link is given with the incident's details.",
  advice: "This is not a lawyer's advice.",
  receive: "This does not say how much you would receive.",
  proof: "This is not proof the money was received.",
  case: "This money does not end the case.",
  summary: "Summary:",
  sections:
    "Road, open drain, workplace, fire, river, rail, and negligence are the sections added for now. More may be added later.",
  settlement: "Stories where money was handed over:",
  kindsLabel: "Kinds of money:",
  kinds: [
    "Demanded",
    "Said they would pay",
    "A report says it was handed over",
    "Court",
    "Government",
    "Insurance",
    "The employer's side",
    "The article does not mention a compensation amount.",
  ],
  feedback: "If you have a suggestion or feedback about this website, tell us on our Facebook page:",
};

function totalLine(lang: Lang): string {
  const total = cases.length;
  if (lang === "bn") {
    return `এই ওয়েবসাইটে এখন ${toBnDigits(String(total))}টি আলাদা মৃত্যুর ঘটনার কথা বলা আছে। সামনে আরও যোগ করা হবে।`;
  }
  return `This website now describes ${total} separate deaths. More will be added.`;
}

function sceneLines(lang: Lang): string[] {
  return sceneCounts(cases).map((row) => {
    if (lang === "bn") {
      const label = sceneLabel[row.scene].bn;
      const total = toBnDigits(String(row.total));
      const amount = toBnDigits(String(row.withAmount));
      const none = toBnDigits(String(row.none));
      const head = row.scene === "road" ? `${label} ${total}টি` : `${label}- ${total}টি`;
      return `${head} ঘটনা আছে। ${amount}টিতে টাকার এমাউন্ট লেখা আছে। ${none}টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।`;
    }
    const label = sceneLabel[row.scene].en;
    return `${label}. There are ${row.total} incidents. An amount is written in ${row.withAmount}. The article does not mention a compensation amount in ${row.none}.`;
  });
}

export function MethodScreen() {
  const { lang, theme, toggleLang, chooseTheme } = usePrefs();
  const copy = lang === "bn" ? BN : EN;
  const scenes = sceneLines(lang);

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={chooseTheme} nav="method" />
      <p className="lead">{copy.intro}</p>
      <p className="lead">{copy.advice}</p>
      <p className="lead">{copy.receive}</p>
      <p className="lead">{copy.proof}</p>
      <p className="lead">{copy.case}</p>
      <p className="lead">{totalLine(lang)}</p>
      <h2 className="section">{copy.settlement}</h2>
      {settlementLines(cases, lang).map((line) => (
        <p className="lead" key={line}>
          {line}
        </p>
      ))}
      <h2 className="section">{copy.summary}</h2>
      {scenes.map((line) => (
        <p className="lead" key={line}>
          {line}
        </p>
      ))}
      <p className="lead">{copy.sections}</p>
      <h2 className="section">{copy.kindsLabel}</h2>
      <ul className="counts">
        {copy.kinds.map((kind) => (
          <li key={kind}>{kind}</li>
        ))}
      </ul>
      <p className="lead">
        {copy.feedback}{" "}
        <a className="text-link" href={FACEBOOK} target="_blank" rel="noreferrer">
          Khotipuron
        </a>
      </p>
    </main>
  );
}
