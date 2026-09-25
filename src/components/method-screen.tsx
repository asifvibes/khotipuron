"use client";

import { TopBar, usePrefs } from "@/components/prefs";
import { cases } from "@/data/cases";
import { collectedYearSpan, kindLabel, paymentBars, sceneCounts, sceneLabel, settlementLines, toBnDigits } from "@/data/logic";
import type { AmountKind, Lang } from "@/data/types";

const KIND_ORDER: AmountKind[] = [
  "demanded",
  "promised",
  "said_handed",
  "court",
  "government",
  "insurance",
  "employer",
  "none",
];

const FACEBOOK = "https://www.facebook.com/khotipuronUpdate/";

const BN = {
  intro:
    "এই ক্ষতিপূরণের টাকার এমাউন্টের তথ্য বিভিন্ন নিউজ পোর্টাল থেকে নেয়া হয়েছে। নিউজের লিংক ঘটনার বিস্তারিত ইনফোর সাথেই দেয়া আছে।",
  advice: "এটি উকিলের পরামর্শ নয়।",
  receive: "কত টাকা পাবেন, তা এখানে বলা হয়নি।",
  proof: "টাকা হাতে পেয়েছেন কি না, তার প্রমাণও এটা নয়।",
  case: "এই টাকা ব্যাপারটা মামলাও শেষ করে না।",
  summary: "সামারিঃ",
  settlement: "ক্ষতিপূরণ দেয়ার খবরঃ",
  kindsLabel: "টাকার ধরনঃ",
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

function chartNote(lang: Lang): string {
  const count = cases.length;
  const span = collectedYearSpan(cases);
  const yearBn = !span
    ? ""
    : span.from === span.to
      ? ` শুধু ${toBnDigits(String(span.from))} সাল।`
      : ` ${toBnDigits(String(span.from))} থেকে ${toBnDigits(String(span.to))} পর্যন্ত।`;
  const yearEn = !span ? "" : span.from === span.to ? ` in ${span.from}.` : ` from ${span.from} to ${span.to}.`;
  if (lang === "bn") {
    return `এই নাম্বারগুলো কেবল ${toBnDigits(String(count))}টা ঘটনার উপর ভিত্তি করে নির্ধারণ করা হয়েছে।${yearBn} দেশে এতগুলো অ্যাক্সিডেন্টই হয়েছে, এমন না। আমরা আরও এরকম নিউজ কালেক্ট করছি। এই নাম্বারগুলো নিয়মিত আপডেট করা হবে।`;
  }
  return `These numbers are based only on the ${count} stories collected here.${yearEn} This is not every accident in the country. We are still collecting news like this. These numbers will be updated.`;
}

function PaymentChart({ lang }: { lang: Lang }) {
  const bars = paymentBars(cases);
  const rows = [
    { key: "dhaka", label: lang === "bn" ? "ঢাকায়" : "Dhaka city", ...bars.dhaka },
    { key: "outside", label: lang === "bn" ? "ঢাকার বাইরে" : "Outside Dhaka", ...bars.outside },
    {
      key: "boat",
      label: lang === "bn" ? "বাইরে, বোট বাদ" : "Outside, without the boat",
      ...bars.outsideNoBoat,
    },
  ];
  const widest = Math.max(...rows.map((row) => row.pct), 1);
  return (
    <figure className="chart">
      <p className="chart-note">{chartNote(lang)}</p>
      {rows.map((row) => (
        <div className="chart-row" key={row.key}>
          <div className="chart-name">{row.label}</div>
          <div className="chart-track" aria-hidden="true">
            <span style={{ width: `${(row.pct / widest) * 100}%` }} />
          </div>
          <div className="chart-value">
            {lang === "bn"
              ? `${toBnDigits(String(row.paid))} / ${toBnDigits(String(row.total))}`
              : `${row.paid} / ${row.total}`}
          </div>
        </div>
      ))}
    </figure>
  );
}

function totalLine(lang: Lang): string {
  const total = cases.length;
  if (lang === "bn") {
    return `এই ওয়েবসাইটে এই মুহূর্তে ${toBnDigits(String(total))}টি আলাদা মৃত্যুর ঘটনার কথা বলা হয়েছে। সামনে আরও যোগ করা হবে।`;
  }
  return `This website now describes ${total} separate deaths. More will be added.`;
}

function sectionsLine(): string {
  const labels = sceneCounts(cases)
    .filter((row) => row.total > 0)
    .map((row) => sceneLabel[row.scene].bn);
  const list = labels.length <= 1 ? labels.join("") : `${labels.slice(0, -1).join(", ")} এবং ${labels[labels.length - 1]}`;
  return `${list} এই কয়টা সেকশন আপাতত এড করা আছে, ফিউচারে আরও এড করা যেতে পারে।`;
}

function sceneLines(lang: Lang): string[] {
  return sceneCounts(cases)
    .filter((row) => row.total > 0)
    .map((row) => {
    if (lang === "bn") {
      const total = toBnDigits(String(row.total));
      const amount = toBnDigits(String(row.withAmount));
      const none = toBnDigits(String(row.none));
      const where: Record<typeof row.scene, string> = {
        road: "সড়কে",
        open_drain: "খোলা ড্রেনে",
        workplace: "কর্মস্থলে",
        fire: "আগুনে",
        river: "নদীতে",
        rail: "রেলে",
        neglect: "অবহেলায়",
      };
      return `${where[row.scene]} ${total}টা খবর। ${amount}টাতে এমাউন্ট আছে। বাকি ${none}টাতে ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি।`;
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
      <h2 className="section" id="settlement">
        {copy.settlement}
      </h2>
      <PaymentChart lang={lang} />
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
      <p className="lead">{lang === "bn" ? sectionsLine() : EN.sections}</p>
      <h2 className="section">{copy.kindsLabel}</h2>
      <ul className="counts">
        {(lang === "bn" ? KIND_ORDER.map((key) => kindLabel[key].bn) : EN.kinds).map((kind) => (
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
