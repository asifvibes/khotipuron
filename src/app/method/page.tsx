import type { Metadata } from "next";
import { MethodScreen } from "@/components/method-screen";

export const metadata: Metadata = {
  title: "খবরের টাকা · ক্ষতিপূরণ",
  description:
    "এই টাকা খবর থেকে নেওয়া। এটি উকিলের পরামর্শ নয়। ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি, এমন খবরের বেশির ভাগ খেলায় আসে না।",
  alternates: { canonical: "https://khotipuron.com/method" },
  openGraph: {
    title: "খবরের টাকা · ক্ষতিপূরণ",
    description:
      "এই টাকা খবর থেকে নেওয়া। এটি উকিলের পরামর্শ নয়। ক্ষতিপূরণের টাকার এমাউন্ট উল্লেখ করা হয় নি, এমন খবরের বেশির ভাগ খেলায় আসে না।",
    url: "https://khotipuron.com/method",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

export default function MethodPage() {
  return <MethodScreen />;
}
