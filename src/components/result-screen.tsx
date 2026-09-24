"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { track } from "@/components/analytics";
import { CaseFacts } from "@/components/case-facts";
import { TopBar, usePrefs } from "@/components/prefs";
import { Scene } from "@/components/scene";
import { ShareActions } from "@/components/share-actions";
import { cases } from "@/data/cases";
import { collectedLine, SEEN_KEY } from "@/data/logic";
import type { CaseRow } from "@/data/types";

function finishedCount(currentId: string): number {
  let ids: string[] = [];
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(parsed)) ids = parsed.filter((id) => typeof id === "string");
  } catch {
    ids = [];
  }
  return new Set([...ids, currentId]).size;
}

export function ResultScreen({ row }: { row: CaseRow }) {
  const { lang, theme, toggleLang, chooseTheme } = usePrefs();
  const [read, setRead] = useState<number | null>(null);

  useEffect(() => {
    setRead(finishedCount(row.id));
    track("story_detail", { id: row.id, surface: "page" });
  }, [row.id]);

  return (
    <main className="shell">
      <TopBar
        lang={lang}
        theme={theme}
        onLang={toggleLang}
        onTheme={chooseTheme}
        nav="game"
        homeHref={`/?from=${row.id}`}
        onMarkClick={() => track("another_story", { source: "wordmark" })}
      />
      <Scene idle="walk" phase="death" scene={row.scene} />
      <CaseFacts row={row} lang={lang} />
      <ShareActions row={row} lang={lang} />
      <Link
        className="retro-btn pair-btn play-link"
        href={`/?from=${row.id}`}
        onClick={() => track("another_story", { source: "button" })}
      >
        {lang === "bn" ? "আরেকটি দেখুন" : "See another"}
      </Link>
      {read != null ? <p className="lead">{collectedLine(cases.length, read, lang)}</p> : null}
    </main>
  );
}
