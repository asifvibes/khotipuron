import type { Metadata } from "next";
import { Game } from "@/components/game";

export const metadata: Metadata = {
  alternates: { canonical: "https://khotipuron.com" },
  openGraph: {
    title: "ক্ষতিপূরণ",
    description:
      "একজন মানুষ হাঁটছেন। তারপর একটি মৃত্যু। তারপর খবরে ক্ষতিপূরণের যে টাকার কথা আছে।",
    url: "https://khotipuron.com",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

export default function HomePage() {
  return <Game />;
}
