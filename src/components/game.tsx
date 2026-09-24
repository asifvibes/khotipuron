"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Scene } from "@/components/scene";
import { cases } from "@/data/cases";
import {
  LANG_KEY,
  SEEN_KEY,
  articleYear,
  formatTaka,
  kindLabel,
  kindSpan,
  pickUnseen,
  sceneLabel,
  toBnDigits,
} from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

type Phase = "loading" | "idle" | "death" | "card" | "empty";
type Idle = "walk" | "sit";

const IDLE_MS = 6500;
const DEATH_MS = 3200;

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function readLang(): Lang {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === "en" ? "en" : "bn";
}

export function Game() {
  const [lang, setLang] = useState<Lang>("bn");
  const [phase, setPhase] = useState<Phase>("loading");
  const [seen, setSeen] = useState<string[]>([]);
  const [current, setCurrent] = useState<CaseRow | null>(null);
  const [idle, setIdle] = useState<Idle>("walk");

  useEffect(() => {
    const storedSeen = readSeen();
    const storedLang = readLang();
    setSeen(storedSeen);
    setLang(storedLang);
    const next = pickUnseen(cases, new Set(storedSeen));
    if (!next) {
      setPhase("empty");
      return;
    }
    setCurrent(next);
    setIdle(Math.random() < 0.5 ? "walk" : "sit");
    setPhase("idle");
  }, []);

  useEffect(() => {
    if (phase !== "idle") return;
    const timer = window.setTimeout(() => setPhase("death"), IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, current?.id]);

  useEffect(() => {
    if (phase !== "death" || !current) return;
    const timer = window.setTimeout(() => {
      setSeen((prev) => {
        if (prev.includes(current.id)) return prev;
        const next = [...prev, current.id];
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
        return next;
      });
      setPhase("card");
    }, DEATH_MS);
    return () => window.clearTimeout(timer);
  }, [phase, current]);

  function toggleLang() {
    const next: Lang = lang === "bn" ? "en" : "bn";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  }

  function replay() {
    const next = pickUnseen(cases, new Set(seen));
    if (!next) {
      setCurrent(null);
      setPhase("empty");
      return;
    }
    setCurrent(next);
    setIdle(Math.random() < 0.5 ? "walk" : "sit");
    setPhase("idle");
  }

  function skipWait() {
    if (phase === "idle") setPhase("death");
    if (phase === "death" && current) {
      setSeen((prev) => {
        if (prev.includes(current.id)) return prev;
        const next = [...prev, current.id];
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
        return next;
      });
      setPhase("card");
    }
  }

  const primary = lang;
  const secondary: Lang = lang === "bn" ? "en" : "bn";

  return (
    <main className="shell">
      <header className="top">
        <p className="mark">{primary === "bn" ? "সাধারণ কাজ" : "An ordinary thing"}</p>
        <div className="controls">
          <Button type="button" variant="outline" className="retro-btn" onClick={toggleLang}>
            {lang === "bn" ? "English" : "বাংলা"}
          </Button>
          <Link className="text-link" href="/method">
            {primary === "bn" ? "পদ্ধতি" : "Method"}
          </Link>
        </div>
      </header>

      {phase === "loading" ? <p className="lead">…</p> : null}

      {phase === "empty" ? <EmptyBoth /> : null}

      {current && (phase === "idle" || phase === "death") ? (
        <section>
          <Scene idle={idle} phase={phase === "death" ? "death" : "idle"} scene={current.scene} />
          <p className="lead">
            {phase === "idle"
              ? idle === "walk"
                ? primary === "bn"
                  ? "হাঁটছিলেন।"
                  : "Walking."
                : primary === "bn"
                  ? "গাছের নিচে বসে ছিলেন।"
                  : "Sitting under a tree."
              : primary === "bn"
                ? `${sceneLabel[current.scene].bn}। সাধারণ মুহূর্ত এখানে থেমে গেল।`
                : `${sceneLabel[current.scene].en}. The ordinary moment stopped.`}
          </p>
          <p className="sub">
            {phase === "idle"
              ? idle === "walk"
                ? secondary === "bn"
                  ? "হাঁটছিলেন।"
                  : "Walking."
                : secondary === "bn"
                  ? "গাছের নিচে বসে ছিলেন।"
                  : "Sitting under a tree."
              : secondary === "bn"
                ? `${sceneLabel[current.scene].bn}। সাধারণ মুহূর্ত এখানে থেমে গেল।`
                : `${sceneLabel[current.scene].en}. The ordinary moment stopped.`}
          </p>
          <Button type="button" variant="outline" className="retro-btn" onClick={skipWait}>
            {primary === "bn" ? "এগোন" : "Continue"}
          </Button>
        </section>
      ) : null}

      {current && phase === "card" ? (
        <CaseCard row={current} primary={primary} secondary={secondary} onReplay={replay} seenCount={seen.length} />
      ) : null}
    </main>
  );
}

function EmptyBoth() {
  return (
    <section className="card-block">
      <p className="name">এই ফাইলের সব ঘটনা আপনি দেখে ফেলেছেন।</p>
      <p className="lead">পুরনো ঘটনা আবার দেখানো হচ্ছে না।</p>
      <p className="sub">You have seen every case in this file. Seen cases are not shown again.</p>
    </section>
  );
}

function CaseCard({
  row,
  primary,
  secondary,
  onReplay,
  seenCount,
}: {
  row: CaseRow;
  primary: Lang;
  secondary: Lang;
  onReplay: () => void;
  seenCount: number;
}) {
  const span = row.amountBdt == null ? null : kindSpan(cases, row.scene, row.amountKind);
  const year = articleYear(row.published);
  const name = primary === "bn" ? row.nameBn : row.nameEn;
  const otherName = secondary === "bn" ? row.nameBn : row.nameEn;
  const doing = primary === "bn" ? row.doingBn : row.doingEn;
  const otherDoing = secondary === "bn" ? row.doingBn : row.doingEn;
  const place = primary === "bn" ? row.locationBn : row.locationEn;
  const otherPlace = secondary === "bn" ? row.locationBn : row.locationEn;

  return (
    <section className="card-block">
      <p className="scene-tag">
        {sceneLabel[row.scene][primary]}
        <span> / {sceneLabel[row.scene][secondary]}</span>
      </p>
      {name ? <h1 className="name">{name}</h1> : null}
      {otherName && otherName !== name ? <p className="sub">{otherName}</p> : null}
      {row.age != null || doing ? (
        <p className="lead">
          {row.age != null ? (primary === "bn" ? `${toBnDigits(String(row.age))} বছর। ` : `${row.age}. `) : null}
          {doing}
        </p>
      ) : null}
      {row.age != null || otherDoing ? (
        <p className="sub">
          {row.age != null ? (secondary === "bn" ? `${toBnDigits(String(row.age))} বছর। ` : `${row.age}. `) : null}
          {otherDoing}
        </p>
      ) : null}
      <p className="place">{place}</p>
      <p className="sub">{otherPlace}</p>

      {row.amountBdt == null ? (
        <>
          <p className="amount none">
            {primary === "bn" ? "কোনো অঙ্কের কথা নেই।" : "No amount was discussed."}
          </p>
          <p className="sub">
            {secondary === "bn" ? "কোনো অঙ্কের কথা নেই।" : "No amount was discussed."}
          </p>
          <p className="sub">
            {primary === "bn"
              ? `প্রতিবেদনের বছর ${toBnDigits(year)}`
              : `Article year ${year}`}
          </p>
        </>
      ) : (
        <>
          <p className="amount">
            {formatTaka(row.amountBdt, primary)}
            <span> · {kindLabel[row.amountKind][primary]} · {primary === "bn" ? toBnDigits(year) : year}</span>
          </p>
          <p className="sub">
            {formatTaka(row.amountBdt, secondary)} · {kindLabel[row.amountKind][secondary]} · {year}
          </p>
        </>
      )}

      <p className="quote">{primary === "bn" ? row.quoteBn : row.quoteEn}</p>
      <p className="sub">{secondary === "bn" ? row.quoteBn : row.quoteEn}</p>

      {row.also ? (
        <p className="also">
          {primary === "bn" ? "আলাদা করে, একই প্রতিবেদনে: " : "Separate, in the same report: "}
          {formatTaka(row.also.amountBdt, primary)} · {kindLabel[row.also.amountKind][primary]}
        </p>
      ) : null}

      {row.noteEn && row.noteBn ? (
        <p className="note">{primary === "bn" ? row.noteBn : row.noteEn}</p>
      ) : null}

      {row.othersDied ? (
        <p className="sub">
          {primary === "bn"
            ? "একই ঘটনায় আরও মানুষ মারা গেছেন।"
            : "The article says other people died in the same incident."}
        </p>
      ) : null}

      {span ? (
        <p className="span">
          {primary === "bn"
            ? `এই দৃশ্যে, একই ধরন: কম ${formatTaka(span.low, "bn")}, বেশি ${formatTaka(span.high, "bn")}। এটা যোগফল নয়।`
            : `This scene, same kind: low ${formatTaka(span.low, "en")}, high ${formatTaka(span.high, "en")}. Not a total.`}
        </p>
      ) : null}

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

      <div className="replay-row">
        <Button type="button" className="retro-btn" onClick={onReplay}>
          {primary === "bn" ? "আরেকটি" : "Another"}
        </Button>
        <p className="sub">
          {primary === "bn"
            ? `${toBnDigits(String(seenCount))}টি দেখা হয়েছে`
            : `${seenCount} seen`}
        </p>
      </div>
    </section>
  );
}
