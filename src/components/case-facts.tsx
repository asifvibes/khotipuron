"use client";

import { useState } from "react";
import {
  dateLine,
  formatTaka,
  incidentSummary,
  kindLabel,
  portraitOf,
  safeText,
  sceneSentence,
} from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

export function CaseFacts({ row, lang }: { row: CaseRow; lang: Lang }) {
  const summary = incidentSummary(row, lang);
  const quote = safeText(row, lang === "bn" ? row.quoteBn : row.quoteEn);
  const note = safeText(row, lang === "bn" ? row.noteBn : row.noteEn);
  const portrait = portraitOf(row);

  return (
    <div>
      <p className="scene-tag">{sceneSentence(row.scene, lang)}</p>
      {summary ? <p className="lead">{summary}</p> : null}
      {quote ? <p className="quote">{quote}</p> : null}
      {row.also && row.amountBdt != null ? (
        <p className="also">
          {lang === "bn" ? "একই খবরে আলাদা আরও একটি টাকার কথা আছে: " : "The same article also states a separate amount: "}
          {formatTaka(row.also.amountBdt, lang)} ({kindLabel[row.also.amountKind][lang]})
        </p>
      ) : null}
      <p className="sub">{dateLine(row, lang)}</p>
      {note ? <p className="note">{note}</p> : null}
      {row.othersDied ? (
        <p className="sub">
          {lang === "bn"
            ? "একই ঘটনায় আরও মানুষ মারা গেছেন।"
            : "The article says other people died in the same incident."}
        </p>
      ) : null}
      <Portrait row={row} portrait={portrait} lang={lang} />
      <p className="note">{lang === "bn" ? "এখানে যা লেখা, তা ওই খবর থেকে নেওয়া।" : "What is written here is taken from that article."}</p>
      <p className="note">{lang === "bn" ? "এটি উকিলের পরামর্শ নয়।" : "This is not a lawyer's advice."}</p>
      <p className="note">{lang === "bn" ? "কত টাকা পাবেন, তা এখানে বলা হয়নি।" : "This does not say how much you would receive."}</p>
      <p className="note">{lang === "bn" ? "টাকা হাতে পেয়েছেন কি না, তার প্রমাণ এটা নয়।" : "This is not proof the money was received."}</p>
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
