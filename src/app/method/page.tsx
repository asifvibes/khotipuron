import type { Metadata } from "next";
import { MethodScreen } from "@/components/method-screen";

export const metadata: Metadata = {
  title: "টাকার কথা · ক্ষতিপূরণ",
  description:
    "টাকাটা খবর থেকে। উকিলের পরামর্শ নয়। কত টাকা পাবেন, তা এখানে বলা নেই। টাকা পেয়েছেন কি না, তার প্রমাণ নয়।",
  alternates: { canonical: "https://khotipuron.com/method" },
  openGraph: {
    title: "টাকার কথা · ক্ষতিপূরণ",
    description:
      "টাকাটা খবর থেকে। উকিলের পরামর্শ নয়। কত টাকা পাবেন, তা এখানে বলা নেই। টাকা পেয়েছেন কি না, তার প্রমাণ নয়।",
    url: "https://khotipuron.com/method",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

export default function MethodPage() {
  return <MethodScreen />;
}
