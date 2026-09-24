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

export function CaseFacts({ row, primary, secondary }: { row: CaseRow; primary: Lang; secondary: Lang }) {
  const summary = incidentSummary(row, primary);
  const otherSummary = incidentSummary(row, secondary);
  const quote = safeText(row, primary === "bn" ? row.quoteBn : row.quoteEn);
  const otherQuote = safeText(row, secondary === "bn" ? row.quoteBn : row.quoteEn);
  const note = safeText(row, primary === "bn" ? row.noteBn : row.noteEn);
  const portrait = portraitOf(row);
  const year = row.amountBdt == null ? null : articleYear(row.published);

  return (
    <div>
      <p className="scene-tag">
        {sceneLabel[row.scene][primary]}
        <span> / {sceneLabel[row.scene][secondary]}</span>
      </p>
      {summary ? <p className="lead">{summary}</p> : null}
      {otherSummary && otherSummary !== summary ? <p className="sub">{otherSummary}</p> : null}
      {quote ? <p className="quote">{quote}</p> : null}
      {otherQuote && otherQuote !== quote ? <p className="sub">{otherQuote}</p> : null}
      {row.also && row.amountBdt != null ? (
        <p className="also">
          {primary === "bn" ? "আলাদা করে, একই প্রতিবেদনে: " : "Separate, in the same report: "}
          {formatTaka(row.also.amountBdt, primary)} · {kindLabel[row.also.amountKind][primary]}
        </p>
      ) : null}
      {year ? (
        <p className="sub">
          {primary === "bn" ? `প্রতিবেদনের বছর ${toBnDigits(year)}` : `Article year ${year}`}
        </p>
      ) : null}
      {note ? <p className="note">{note}</p> : null}
      {row.othersDied ? (
        <p className="sub">
          {primary === "bn"
            ? "একই ঘটনায় আরও মানুষ মারা গেছেন।"
            : "The article says other people died in the same incident."}
        </p>
      ) : null}
      <Portrait row={row} portrait={portrait} primary={primary} />
      <p className="note">
        {primary === "bn"
          ? "এখানে যা আছে, তা প্রতিবেদনে যা আলোচিত হয়েছে। আইনি পরামর্শ নয়, পূর্বাভাস নয়, টাকা পাওয়ার প্রমাণ নয়।"
          : "What is here is what the article discussed. Not legal advice, not a forecast, and not proof the money was received."}
      </p>
      <p className="sub">
        {secondary === "bn"
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
  primary,
}: {
  row: CaseRow;
  portrait: { url: string; creditEn: string; creditBn: string } | null;
  primary: Lang;
}) {
  const [failed, setFailed] = useState(false);
  if (!portrait || failed) return null;
  const name = primary === "bn" ? row.nameBn : row.nameEn;
  return (
    <figure className="portrait">
      {/* Point at the article's picture. Do not copy it into this site. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={portrait.url} alt={name ?? ""} onError={() => setFailed(true)} />
      <figcaption className="sub">
        {primary === "bn" ? portrait.creditBn : portrait.creditEn}{" "}
        <a href={row.url} target="_blank" rel="noreferrer">
          {row.outlet}
        </a>
      </figcaption>
    </figure>
  );
}
