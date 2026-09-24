"use client";

import Link from "next/link";
import { CaseFacts } from "@/components/case-facts";
import { TopBar, usePrefs } from "@/components/prefs";
import { Scene } from "@/components/scene";
import { ShareActions } from "@/components/share-actions";
import { familyLine } from "@/data/logic";
import type { CaseRow } from "@/data/types";

export function ResultScreen({ row }: { row: CaseRow }) {
  const { lang, theme, toggleLang, toggleTheme } = usePrefs();
  const name = lang === "bn" ? row.nameBn : row.nameEn;

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={toggleTheme} nav="game" />
      <Scene idle="walk" phase="death" scene={row.scene} />
      {name ? <h1 className="name">{name}</h1> : null}
      <p className="lead">{familyLine(row, lang)}</p>
      <CaseFacts row={row} lang={lang} />
      <ShareActions row={row} lang={lang} />
      <Link className="retro-btn share-link play-link" href={`/?from=${row.id}`}>
        {lang === "bn" ? "আরেকটা খেলুন" : "Play another"}
      </Link>
    </main>
  );
}
