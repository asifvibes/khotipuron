import type { Metadata } from "next";
import { MethodScreen } from "@/components/method-screen";

export const metadata: Metadata = {
  title: "ক্ষতিপূরণ",
  description:
    "এই ক্ষতিপূরণের টাকার এমাউন্টের তথ্য বিভিন্ন নিউজ পোর্টাল থেকে নেয়া হয়েছে। নিউজের লিংক ঘটনার বিস্তারিত ইনফোর সাথেই দেয়া আছে।",
  alternates: { canonical: "https://khotipuron.com/method" },
  openGraph: {
    title: "ক্ষতিপূরণ",
    description:
      "এই ক্ষতিপূরণের টাকার এমাউন্টের তথ্য বিভিন্ন নিউজ পোর্টাল থেকে নেয়া হয়েছে। নিউজের লিংক ঘটনার বিস্তারিত ইনফোর সাথেই দেয়া আছে।",
    url: "https://khotipuron.com/method",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

export default function MethodPage() {
  return <MethodScreen />;
}
