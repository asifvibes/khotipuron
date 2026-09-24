import type { Metadata } from "next";
import { MethodScreen } from "@/components/method-screen";
import { PUBLIC_ORIGIN } from "@/data/logic";

const shareImage = `${PUBLIC_ORIGIN}/opengraph-image`;

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
    images: [{ url: shareImage, width: 1200, height: 1200, alt: "ক্ষতিপূরণ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ক্ষতিপূরণ",
    description:
      "এই ক্ষতিপূরণের টাকার এমাউন্টের তথ্য বিভিন্ন নিউজ পোর্টাল থেকে নেয়া হয়েছে। নিউজের লিংক ঘটনার বিস্তারিত ইনফোর সাথেই দেয়া আছে।",
    images: [shareImage],
  },
};

export default function MethodPage() {
  return <MethodScreen />;
}
