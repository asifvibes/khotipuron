import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResultScreen } from "@/components/result-screen";
import { findCase } from "@/data/cases";
import { ogDescription, ogTitle, publicCaseUrl } from "@/data/logic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = findCase(id);
  if (!row) return { title: "ক্ষতিপূরণ" };
  const title = ogTitle(row);
  const description = ogDescription(row);
  const url = publicCaseUrl(row.id);
  const image = `${url}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "ক্ষতিপূরণ",
      locale: "bn_BD",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "ক্ষতিপূরণ" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = findCase(id);
  if (!row) notFound();
  return <ResultScreen row={row} />;
}
