"use client";

import { useEffect, useState } from "react";
import { CaseFacts } from "@/components/case-facts";
import { TopBar, usePrefs } from "@/components/prefs";
import { Scene } from "@/components/scene";
import { ShareActions } from "@/components/share-actions";
import { Button } from "@/components/ui/button";
import { cases } from "@/data/cases";
import { momentLine } from "@/data/moment";
import { collectedLine, deathLine, pickUnseen, SEEN_KEY, toBnDigits } from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

type Phase = "loading" | "idle" | "count" | "accident" | "card" | "empty";
type Idle = "walk" | "sit";

const IDLE_MS = 2200;
const ACCIDENT_MS = 2500;

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

      {current && (phase === "idle" || phase === "count") ? (
        <p className="lead">{momentLine(current, idle, lang)}</p>
      ) : null}
      {current && phase === "accident" ? <p className="death-line">{deathLine(current.scene, lang)}</p> : null}

      {current && phase === "card" ? (
        <CaseCard row={current} lang={lang} read={new Set(seen).add(current.id).size} onReplay={replay} />
      ) : null}
    </main>
  );
}

function CaseCard({
  row,
  lang,
  read,
  onReplay,
}: {
  row: CaseRow;
  lang: Lang;
  read: number;
  onReplay: () => void;
}) {
  return (
    <section>
      <CaseFacts row={row} lang={lang} />
      <ShareActions row={row} lang={lang} />
      <Button type="button" className="retro-btn pair-btn" onClick={onReplay}>
        {lang === "bn" ? "আরেকটি দেখুন" : "See another"}
      </Button>
      <p className="lead">{collectedLine(cases.length, read, lang)}</p>
    </section>
  );
}

function EmptyPool({ lang }: { lang: Lang }) {
  function goHome() {
    localStorage.removeItem(SEEN_KEY);
    window.location.assign("/");
  }

  const bn = lang === "bn";
  return (
    <section>
      <p className="lead">
        {bn
          ? "বর্তমানে ওয়েবসাইটে থাকা সকল ঘটনার কথা আপনি জেনে ফেলেছেন। আগের পুরনো ঘটনাগুলো আবার দেখতে চাইলে হোমপেইজে ফিরে যান। অথবা আমাদেরকে নতুন ঘটনার কথা বলুন আমাদের ফেসবুক পেইজে।"
          : "You have now seen every incident on the site. To see the earlier ones again, go back to the homepage. Or tell us about a new incident on our Facebook page."}
      </p>
      <div className="pair">
        <Button type="button" className="retro-btn pair-btn" onClick={goHome}>
          {bn ? "হোমপেইজ" : "Homepage"}
        </Button>
        <a
          className="retro-btn pair-btn"
          href="https://www.facebook.com/khotipuronUpdate/"
          target="_blank"
          rel="noreferrer"
        >
          {bn ? "ফেসবুক পেইজ" : "Facebook page"}
        </a>
      </div>
    </section>
  );
}
