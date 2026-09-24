import type { Metadata } from "next";
import { Game } from "@/components/game";

export const metadata: Metadata = {
  alternates: { canonical: "https://khotipuron.com" },
  openGraph: {
    title: "ক্ষতিপূরণ",
    description:
      "হাঁটছেন। তারপর মৃত্যু। তারপর সংবাদে কত টাকার কথা।",
    url: "https://khotipuron.com",
    siteName: "ক্ষতিপূরণ",
    locale: "bn_BD",
    type: "website",
  },
};

export default function HomePage() {
  return <Game />;
}
