"use client";

import { useState } from "react";
import {
  dateLine,
  familyLine,
  incidentSummary,
  stakeLine,
  NO_AMOUNT_BN,
  NO_AMOUNT_EN,
  portraitOf,
  safeText,
  sceneSentence,
} from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

export function CaseFacts({ row, lang }: { row: CaseRow; lang: Lang }) {
  const summary = incidentSummary(row, lang);
  const quote = reportedLine(row, lang === "bn" ? row.quoteBn : row.quoteEn);
  const alsoQuote = row.also ? reportedLine(row, lang === "bn" ? row.also.quoteBn : row.also.quoteEn) : null;
  const note = reportedLine(row, lang === "bn" ? row.noteBn : row.noteEn);
  const portrait = portraitOf(row);
  const bn = lang === "bn";
  const sources = [{ url: row.url, outlet: row.outlet }, ...row.extraSources];
  const stake = <p className="stake">{stakeLine(row, lang)}</p>;
  // Same story keeps the same place. A new story can land in a different one.
  const slot = stakeSlot(row.id);

  return (
    <div>
      <p className="lead">{familyLine(row, lang)}</p>
      <p className="lead">{sceneSentence(row.scene, lang)}</p>
      {summary ? <p className="lead">{summary}</p> : null}
      {slot === "middle" ? stake : null}
      {quote ? <p className="lead">{quote}</p> : null}
      {alsoQuote ? <p className="lead">{alsoQuote}</p> : null}
      <p className="lead">{dateLine(row, lang)}</p>
      {note ? <p className="lead">{note}</p> : null}
      {row.othersDied ? (
        <p className="lead">
          {bn ? "খবরে আছে, একই ঘটনায় আরও মানুষ মারা গেছেন।" : "The article says other people died in the same incident."}
        </p>
      ) : null}
      <Portrait row={row} portrait={portrait} lang={lang} />
      {slot === "before" ? stake : null}
      {sources.map((source) => (
        <p className="source-line" key={source.url}>
          {bn ? "নিউজ সোর্সঃ " : "News source: "}
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.outlet}
          </a>
        </p>
      ))}
      {slot === "after" ? stake : null}
    </div>
  );
}

function stakeSlot(id: string): "middle" | "before" | "after" {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n + id.charCodeAt(i)) % 3;
  return n === 0 ? "middle" : n === 1 ? "before" : "after";
}

function reportedLine(row: CaseRow, text: string | null): string | null {
  const line = safeText(row, text);
  if (!line || line === NO_AMOUNT_BN || line === NO_AMOUNT_EN) return null;
  return line;
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
