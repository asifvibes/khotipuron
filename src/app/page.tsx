import type { Metadata } from "next";
import { Game } from "@/components/game";
import { PUBLIC_ORIGIN } from "@/data/logic";

const shareImage = `${PUBLIC_ORIGIN}/opengraph-image`;

export const metadata: Metadata = {
  alternates: { canonical: "https://khotipuron.com" },
  openGraph: {
    title: "ক্ষতিপূরণ",
    description:
      "এক পা, আরেক পা। তারপর শেষ পা। বাকি রইলো শুধু খবরে ঘোষিত সেই ক্ষতিপূরণ, যাকে টাকায় মাপা হয়।",
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
      "এক পা, আরেক পা। তারপর শেষ পা। বাকি রইলো শুধু খবরে ঘোষিত সেই ক্ষতিপূরণ, যাকে টাকায় মাপা হয়।",
    images: [shareImage],
  },
};

export default function HomePage() {
  return <Game />;
}
