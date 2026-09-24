"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaseFacts } from "@/components/case-facts";
import { Scene } from "@/components/scene";
import { ShareActions } from "@/components/share-actions";
import { Button } from "@/components/ui/button";
import { familyLine, LANG_KEY } from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

export function ResultScreen({ row }: { row: CaseRow }) {
  const [lang, setLang] = useState<Lang>("bn");

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "en") setLang("en");
  }, []);

  function toggleLang() {
    const next: Lang = lang === "bn" ? "en" : "bn";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  }

  const secondary: Lang = lang === "bn" ? "en" : "bn";
  const name = lang === "bn" ? row.nameBn : row.nameEn;

  return (
    <main className="shell">
      <header className="top">
        <div className="brand">
          <p className="mark">ক্ষতিপূরণ</p>
          <p className="mark-latin">Khotipuron</p>
        </div>
        <div className="controls">
          <Button type="button" variant="outline" className="retro-btn" onClick={toggleLang}>
            {lang === "bn" ? "English" : "বাংলা"}
          </Button>
          <Link className="text-link" href="/method">
            {lang === "bn" ? "পদ্ধতি" : "Method"}
          </Link>
        </div>
      </header>
      <Scene idle="walk" phase="death" scene={row.scene} />
      {name ? <h1 className="name">{name}</h1> : null}
      <p className="lead">{familyLine(row, lang)}</p>
      <p className="sub">{familyLine(row, secondary)}</p>
      <CaseFacts row={row} primary={lang} secondary={secondary} />
      <ShareActions row={row} lang={lang} />
      <Link className="retro-btn share-link play-link" href={`/?from=${row.id}`}>
        {lang === "bn" ? "খেলা শুরু, নতুন একটি ঘটনা" : "Play and draw a new case"}
      </Link>
    </main>
  );
}
