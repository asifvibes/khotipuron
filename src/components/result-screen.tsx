"use client";

import Link from "next/link";
import { CaseFacts } from "@/components/case-facts";
import { TopBar, usePrefs } from "@/components/prefs";
import { Scene } from "@/components/scene";
import { ShareActions } from "@/components/share-actions";
import { familyLine } from "@/data/logic";
import type { CaseRow } from "@/data/types";

export function ResultScreen({ row }: { row: CaseRow }) {
  const { lang, theme, toggleLang, chooseTheme } = usePrefs();
  const name = lang === "bn" ? row.nameBn : row.nameEn;

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={chooseTheme} nav="game" />
      <Scene idle="walk" phase="death" scene={row.scene} />
      {name ? <h1 className="name">{name}</h1> : null}
      <p className="lead">{familyLine(row, lang)}</p>
      <CaseFacts row={row} lang={lang} />
      <ShareActions row={row} lang={lang} />
      <Link className="retro-btn pair-btn play-link" href={`/?from=${row.id}`}>
        {lang === "bn" ? "আরেকটি দেখুন" : "See another"}
      </Link>
    </main>
  );
}
