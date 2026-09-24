import type { Metadata } from "next";
import { MethodScreen } from "@/components/method-screen";

export const metadata: Metadata = {
  title: "পদ্ধতি · ক্ষতিপূরণ",
  description: "এই অঙ্ক একটি সংবাদে যা আলোচিত হয়েছে। আইনি পরামর্শ নয়, পূর্বাভাস নয়, টাকা পাওয়ার প্রমাণ নয়।",
  alternates: { canonical: "https://khotipuron.com/method" },
  openGraph: {
    title: "পদ্ধতি · ক্ষতিপূরণ",
    description: "এই অঙ্ক একটি সংবাদে যা আলোচিত হয়েছে। আইনি পরামর্শ নয়, পূর্বাভাস নয়, টাকা পাওয়ার প্রমাণ নয়।",
    url: "https://khotipuron.com/method",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

export default function MethodPage() {
  return <MethodScreen />;
}
