import type { Metadata } from "next";
import { Game } from "@/components/game";

export const metadata: Metadata = {
  alternates: { canonical: "https://khotipuron.com" },
  openGraph: {
    title: "ক্ষতিপূরণ / Khotipuron",
    description:
      "একটা সাধারণ মুহূর্ত, তারপর একটি মৃত্যু, তারপর একটি সংবাদে ক্ষতিপূরণ নিয়ে যা আলোচিত হয়েছে।",
    url: "https://khotipuron.com",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

export default function HomePage() {
  return <Game />;
}
