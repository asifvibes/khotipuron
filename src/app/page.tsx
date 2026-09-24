import type { Metadata } from "next";
import { Game } from "@/components/game";
import { PUBLIC_ORIGIN } from "@/data/logic";

const shareImage = `${PUBLIC_ORIGIN}/opengraph-image`;

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
    images: [{ url: shareImage, width: 1200, height: 630, alt: "ক্ষতিপূরণ" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ক্ষতিপূরণ",
    description:
      "একজন মানুষ হাঁটছেন। তারপর একটি মৃত্যু। তারপর খবরে ক্ষতিপূরণের যে টাকার কথা আছে।",
    images: [shareImage],
  },
};

export default function HomePage() {
  return <Game />;
}
