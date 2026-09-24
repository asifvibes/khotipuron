import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-bengali",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://khotipuron.com"),
  title: "ক্ষতিপূরণ / Khotipuron",
  description:
    "একটা সাধারণ মুহূর্ত, তারপর একটি মৃত্যু, তারপর একটি সংবাদে ক্ষতিপূরণ নিয়ে যা আলোচিত হয়েছে।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={`${bengali.variable} antialiased`}>{children}</body>
    </html>
  );
}
