"use client";

import { useState } from "react";
import {
  articleYear,
  formatTaka,
  incidentSummary,
  kindLabel,
  portraitOf,
  safeText,
  sceneLabel,
  toBnDigits,
} from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

export function CaseFacts({ row, lang }: { row: CaseRow; lang: Lang }) {
  const summary = incidentSummary(row, lang);
  const quote = safeText(row, lang === "bn" ? row.quoteBn : row.quoteEn);
  const note = safeText(row, lang === "bn" ? row.noteBn : row.noteEn);
  const portrait = portraitOf(row);
  const year = row.amountBdt == null ? null : articleYear(row.published);

  return (
    <div>
      <p className="scene-tag">{sceneLabel[row.scene][lang]}</p>
      {summary ? <p className="lead">{summary}</p> : null}
      {quote ? <p className="quote">{quote}</p> : null}
      {row.also && row.amountBdt != null ? (
        <p className="also">
          {lang === "bn" ? "আলাদা করে, একই প্রতিবেদনে: " : "Separate, in the same report: "}
          {formatTaka(row.also.amountBdt, lang)} · {kindLabel[row.also.amountKind][lang]}
        </p>
      ) : null}
      {year ? (
        <p className="sub">
          {lang === "bn" ? `প্রতিবেদনের বছর ${toBnDigits(year)}` : `Article year ${year}`}
        </p>
      ) : null}
      {note ? <p className="note">{note}</p> : null}
      {row.othersDied ? (
        <p className="sub">
          {lang === "bn"
            ? "একই ঘটনায় আরও মানুষ মারা গেছেন।"
            : "The article says other people died in the same incident."}
        </p>
      ) : null}
      <Portrait row={row} portrait={portrait} lang={lang} />
      <p className="note">
        {lang === "bn"
          ? "এখানে যা আছে, তা প্রতিবেদনে যা আলোচিত হয়েছে। আইনি পরামর্শ নয়, পূর্বাভাস নয়, টাকা পাওয়ার প্রমাণ নয়।"
          : "What is here is what the article discussed. Not legal advice, not a forecast, and not proof the money was received."}
      </p>
      <p className="links">
        <a href={row.url} target="_blank" rel="noreferrer">
          {row.outlet}
        </a>
        {row.extraSources.map((source) => (
          <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
            {source.outlet}
          </a>
        ))}
      </p>
    </div>
  );
}

function Portrait({
  row,
  portrait,
  lang,
}: {
  row: CaseRow;
  portrait: { url: string; creditEn: string; creditBn: string } | null;
  lang: Lang;
}) {
  const [failed, setFailed] = useState(false);
  if (!portrait || failed) return null;
  const name = lang === "bn" ? row.nameBn : row.nameEn;
  return (
    <figure className="portrait">
      {/* Point at the article's picture. Do not copy it into this site. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={portrait.url} alt={name ?? ""} onError={() => setFailed(true)} />
      <figcaption className="sub">
        {lang === "bn" ? portrait.creditBn : portrait.creditEn}{" "}
        <a href={row.url} target="_blank" rel="noreferrer">
          {row.outlet}
        </a>
      </figcaption>
    </figure>
  );
}
