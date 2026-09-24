"use client";

import { useEffect, useState } from "react";
import { CaseFacts } from "@/components/case-facts";
import { TopBar, usePrefs } from "@/components/prefs";
import { Scene } from "@/components/scene";
import { ShareActions } from "@/components/share-actions";
import { Button } from "@/components/ui/button";
import { cases } from "@/data/cases";
import { deathLine, familyLine, ordinaryLine, pickUnseen, SEEN_KEY, toBnDigits } from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

type Phase = "loading" | "idle" | "count" | "accident" | "card" | "empty";
type Idle = "walk" | "sit";

const IDLE_MS = 2200;
const ACCIDENT_MS = 1800;

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function Game() {
  const { lang, theme, toggleLang, chooseTheme } = usePrefs();
  const [phase, setPhase] = useState<Phase>("loading");
  const [count, setCount] = useState(5);
  const [seen, setSeen] = useState<string[]>([]);
  const [current, setCurrent] = useState<CaseRow | null>(null);
  const [idle, setIdle] = useState<Idle>("walk");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    if (from) {
      params.delete("from");
      const next = params.toString();
      window.history.replaceState({}, "", next ? `/?${next}` : "/");
    }
    const storedSeen = readSeen();
    const seenIds = new Set(storedSeen);
    if (from && cases.some((row) => row.id === from)) seenIds.add(from);
    const nextSeen = [...seenIds];
    if (from && nextSeen.length !== storedSeen.length) {
      localStorage.setItem(SEEN_KEY, JSON.stringify(nextSeen));
    }
    setSeen(nextSeen);
    const next = pickUnseen(cases, seenIds);
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
    const timer = window.setTimeout(() => {
      setCount(5);
      setPhase("count");
    }, IDLE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, current?.id]);

  useEffect(() => {
    if (phase !== "count" || !current) return;
    const timer = window.setTimeout(() => {
      if (count <= 0) {
        setPhase("accident");
        return;
      }
      setCount((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [phase, count, current]);

  useEffect(() => {
    if (phase !== "accident" || !current) return;
    const id = current.id;
    const timer = window.setTimeout(() => {
      setSeen((prev) => {
        if (prev.includes(id)) return prev;
        const next = [...prev, id];
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
        return next;
      });
      setPhase("card");
    }, ACCIDENT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, current]);

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

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={chooseTheme} nav="game" />

      {phase === "loading" ? <p className="lead">…</p> : null}
      {phase === "empty" ? <EmptyPool lang={lang} /> : null}

      {current && phase !== "loading" && phase !== "empty" ? (
        <Scene
          idle={idle}
          phase={phase === "accident" || phase === "card" ? "death" : "idle"}
          scene={current.scene}
          hit={phase === "accident"}
          countLabel={phase === "count" ? (lang === "bn" ? toBnDigits(String(count)) : String(count)) : null}
        />
      ) : null}

      {current && (phase === "idle" || phase === "count" || phase === "accident") ? (
        <p className="lead">{phase === "accident" ? deathLine(current.scene, lang) : ordinaryLine(idle, lang)}</p>
      ) : null}

      {current && phase === "card" ? (
        <CaseCard row={current} lang={lang} seen={seen.length} onReplay={replay} />
      ) : null}
    </main>
  );
}

function CaseCard({
  row,
  lang,
  seen,
  onReplay,
}: {
  row: CaseRow;
  lang: Lang;
  seen: number;
  onReplay: () => void;
}) {
  const name = lang === "bn" ? row.nameBn : row.nameEn;
  return (
    <section>
      {name ? <h1 className="name">{name}</h1> : null}
      <p className="lead">{familyLine(row, lang)}</p>
      <CaseFacts row={row} lang={lang} />
      <ShareActions row={row} lang={lang} />
      <Button type="button" className="retro-btn pair-btn" onClick={onReplay}>
        {lang === "bn" ? "আরেকটি দেখুন" : "See another"}
      </Button>
      {row.amountBdt != null ? (
        <p className="sub">
          {lang === "bn" ? `আপনি এ পর্যন্ত ${toBnDigits(String(seen))}টি খবর দেখেছেন।` : `You have seen ${seen} stories so far.`}
        </p>
      ) : null}
    </section>
  );
}

function EmptyPool({ lang }: { lang: Lang }) {
  return (
    <section>
      <p className="name">
        {lang === "bn" ? "খেলায় যে খবর আসে, আপনি সেগুলো দেখে ফেলেছেন।" : "You have seen every story this game draws."}
      </p>
      <p className="lead">
        {lang === "bn" ? "একবার দেখা খবর আর আসে না।" : "A story you have seen does not come back."}
      </p>
    </section>
  );
}
