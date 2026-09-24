import type { Metadata } from "next";
import Link from "next/link";
import { cases } from "@/data/cases";
import { kindLabel, sceneCounts, sceneLabel, toBnDigits } from "@/data/logic";
import type { AmountKind } from "@/data/types";

export const metadata: Metadata = {
  title: "পদ্ধতি · ক্ষতিপূরণ / Khotipuron",
  description:
    "এই অঙ্ক একটি সংবাদে যা আলোচিত হয়েছে। আইনি পরামর্শ নয়, পূর্বাভাস নয়, টাকা পাওয়ার প্রমাণ নয়।",
  alternates: { canonical: "https://khotipuron.com/method" },
  openGraph: {
    title: "পদ্ধতি · ক্ষতিপূরণ / Khotipuron",
    description:
      "The figure is what a news article discussed, not legal advice, not a forecast, and not proof the money was received.",
    url: "https://khotipuron.com/method",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

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

export default function MethodPage() {
  const counts = sceneCounts(cases);
  const filled = counts.filter((row) => row.total > 0);
  const empty = counts.filter((row) => row.total === 0);

  return (
    <main className="shell">
      <div className="brand">
        <p className="mark">ক্ষতিপূরণ</p>
        <p className="mark-latin">Khotipuron</p>
      </div>
      <p className="sub">পদ্ধতি / Method</p>
      <h1 className="name">অঙ্কটি সংবাদে যা আলোচিত হয়েছে</h1>
      <p className="lead">
        এই অঙ্ক একটি সংবাদ প্রতিবেদনে যা আলোচনা হয়েছে, সেটা। এটা আইনি পরামর্শ নয়, পূর্বাভাস নয়, এবং টাকা পাওয়া গেছে তার প্রমাণ নয়।
      </p>
      <p className="sub">
        The figure is what a news article discussed, not legal advice, not a forecast, and not proof the money was received.
      </p>
      <p className="lead">
        ব্যক্তিগত একটি অঙ্ক ফৌজদারি মামলার ফয়সালা নয়। বারিধারার প্রতিবেদনে অভিযুক্ত কিশোরকে এখানে দেখানো হয় না।
      </p>
      <p className="sub">
        A private sum does not decide a criminal case. The accused teenager in the Baridhara reports is not shown.
      </p>
      <p className="lead">
        এই ফাইলে {toBnDigits(String(cases.length))}টি আলাদা মৃত্যু। একই মৃত্যু দুইবার নেই। খেলোয়াড় যে ঘটনা দেখেছেন, সেটি আবার আসে না।
      </p>
      <p className="sub">
        This file has {cases.length} distinct deaths. The same death is not entered twice. A case the player has seen does not return.
      </p>

      <h2 className="section">দৃশ্য</h2>
      <ul className="counts">
        {filled.map((row) => (
          <li key={row.scene}>
            <strong>{sceneLabel[row.scene].bn}</strong>
            <span> / {sceneLabel[row.scene].en}</span>
            <span>
              {" "}
              {toBnDigits(String(row.total))}টি, অঙ্ক আছে {toBnDigits(String(row.withAmount))}টিতে, নেই{" "}
              {toBnDigits(String(row.none))}টিতে
            </span>
            <span className="sub">
              {" "}
              {row.total} cases, {row.withAmount} with a discussed amount, {row.none} with none
            </span>
          </li>
        ))}
      </ul>
      {empty.length === 0 ? (
        <p className="lead">খালি দৃশ্য নেই। সড়ক, খোলা ড্রেন, কর্মস্থল, আগুন, নদী, রেল, এবং অবহেলা এই ফাইলে আছে।</p>
      ) : (
        <p className="lead">
          যে দৃশ্যের কোনো প্রতিবেদন নেই, সেটি খেলায় আসে না: {empty.map((row) => sceneLabel[row.scene].bn).join(", ")}।
        </p>
      )}
      <p className="sub">
        {empty.length === 0
          ? "No scene type in this file is empty. Road, open drain, workplace, fire, river, rail, and negligence are all present."
          : `Scenes with no coded article are not drawn: ${empty.map((row) => sceneLabel[row.scene].en).join(", ")}.`}
      </p>

      <h2 className="section">অঙ্কের ধরন</h2>
      <ul className="counts">
        {kinds.map((kind) => (
          <li key={kind}>
            {kindLabel[kind].bn} <span className="sub">/ {kindLabel[kind].en}</span>
          </li>
        ))}
      </ul>
      <p className="lead">দুই ধরনের টাকা যোগ করে একটি অঙ্ক বানানো হয় না।</p>
      <p className="sub">Two kinds of money are not added into one figure.</p>
      <p className="links">
        <Link href="/">খেলায় ফিরুন</Link>
      </p>
    </main>
  );
}
