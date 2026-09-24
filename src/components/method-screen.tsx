"use client";

import { TopBar, usePrefs } from "@/components/prefs";

const FACEBOOK = "https://www.facebook.com/khotipuronUpdate/";

const BN = {
  intro:
    "এই ক্ষতিপূরণের টাকার এমাউন্টের তথ্য বিভিন্ন নিউজ পোর্টাল থেকে নেয়া হয়েছে। নিউজের লিংক ঘটনার বিস্তারিত ইনফোর সাথেই দেয়া আছে।",
  advice: "এটি উকিলের পরামর্শ নয়।",
  receive: "কত টাকা পাবেন, তা এখানে বলা হয়নি।",
  proof: "টাকা হাতে পেয়েছেন কি না, তার প্রমাণ এটা নয়।",
  case: "এই টাকা মামলা শেষ করে না।",
  total: "এই ওয়েবসাইটে এখন ৬৬টি আলাদা মৃত্যুর ঘটনার কথা বলা আছে। সামনে আরও যোগ করা হবে।",
  summary: "সামারিঃ",
  scenes: [
    "সড়ক ৪৫টি ঘটনা আছে। ৪টিতে টাকার এমাউন্ট লেখা আছে। ৪১টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।",
    "খোলা ড্রেন- ৪টি ঘটনা আছে। ০টিতে টাকার এমাউন্ট লেখা আছে। ৪টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।",
    "কর্মস্থল- ৬টি ঘটনা আছে। ২টিতে টাকার এমাউন্ট লেখা আছে। ৪টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।",
    "আগুন- ২টি ঘটনা আছে। ০টিতে টাকার এমাউন্ট লেখা আছে। ২টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।",
    "নদী- ৫টি ঘটনা আছে। ০টিতে টাকার এমাউন্ট লেখা আছে। ৫টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।",
    "রেল- ২টি ঘটনা আছে। ০টিতে টাকার এমাউন্ট লেখা আছে। ২টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।",
    "অবহেলা- ২টি ঘটনা আছে। ০টিতে টাকার এমাউন্ট লেখা আছে। ২টিতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।",
  ],
  sections:
    "সড়ক, খোলা ড্রেন, কর্মস্থল, আগুন, নদী, রেল এবং অবহেলা এই কয়টা সেকশন আপাতত এড করা আছে, ফিউচারে আরও এড করা যেতে পারে।",
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
  total: "This website now describes 66 separate deaths. More will be added.",
  summary: "Summary:",
  scenes: [
    "Road. There are 45 incidents. An amount is written in 4. The article does not mention a compensation amount in 41.",
    "Open drain. There are 4 incidents. An amount is written in 0. The article does not mention a compensation amount in 4.",
    "Workplace. There are 6 incidents. An amount is written in 2. The article does not mention a compensation amount in 4.",
    "Fire. There are 2 incidents. An amount is written in 0. The article does not mention a compensation amount in 2.",
    "River. There are 5 incidents. An amount is written in 0. The article does not mention a compensation amount in 5.",
    "Rail. There are 2 incidents. An amount is written in 0. The article does not mention a compensation amount in 2.",
    "Negligence. There are 2 incidents. An amount is written in 0. The article does not mention a compensation amount in 2.",
  ],
  sections:
    "Road, open drain, workplace, fire, river, rail, and negligence are the sections added for now. More may be added later.",
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

export function MethodScreen() {
  const { lang, theme, toggleLang, chooseTheme } = usePrefs();
  const copy = lang === "bn" ? BN : EN;

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={chooseTheme} nav="method" />
      <p className="lead">{copy.intro}</p>
      <p className="lead">{copy.advice}</p>
      <p className="lead">{copy.receive}</p>
      <p className="lead">{copy.proof}</p>
      <p className="lead">{copy.case}</p>
      <p className="lead">{copy.total}</p>
      <h2 className="section">{copy.summary}</h2>
      {copy.scenes.map((line) => (
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
