"use client";

import { useEffect, useState } from "react";
import { CaseFacts } from "@/components/case-facts";
import { TopBar, usePrefs } from "@/components/prefs";
import { Scene } from "@/components/scene";
import { ShareActions } from "@/components/share-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cases } from "@/data/cases";
import { familyLine, pickUnseen, sceneLabel, SEEN_KEY, toBnDigits } from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

type Phase = "loading" | "idle" | "count" | "card" | "empty";
type Idle = "walk" | "sit";

const IDLE_MS = 6500;

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
  const [reportOpen, setReportOpen] = useState(false);

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
    const id = current.id;
    const timer = window.setTimeout(() => {
      if (count <= 1) {
        setSeen((prev) => {
          if (prev.includes(id)) return prev;
          const next = [...prev, id];
          localStorage.setItem(SEEN_KEY, JSON.stringify(next));
          return next;
        });
        setPhase("card");
        return;
      }
      setCount((value) => value - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [phase, count, current]);

  useEffect(() => {
    if (phase !== "card") {
      setReportOpen(false);
      return;
    }
    const timer = window.setTimeout(() => setReportOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [phase, current?.id]);

  function replay() {
    const next = pickUnseen(cases, new Set(seen));
    if (!next) {
      setCurrent(null);
      setReportOpen(false);
      setPhase("empty");
      return;
    }
    setCurrent(next);
    setIdle(Math.random() < 0.5 ? "walk" : "sit");
    setReportOpen(false);
    setPhase("idle");
  }

  function beginCount() {
    if (phase !== "idle") return;
    setCount(5);
    setPhase("count");
  }

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={chooseTheme} nav="game" />

      {phase === "loading" ? <p className="lead">…</p> : null}
      {phase === "empty" ? <EmptyPool lang={lang} /> : null}

      {current && phase !== "loading" && phase !== "empty" ? (
        <Scene
          idle={idle}
          phase={phase === "idle" || (phase === "count" && count > 2) ? "idle" : "death"}
          scene={current.scene}
          rush={phase === "count"}
          hit={phase === "count" && count === 1}
          countLabel={phase === "count" ? (lang === "bn" ? toBnDigits(String(count)) : String(count)) : null}
        />
      ) : null}

      {current && (phase === "idle" || phase === "count") ? (
        <section>
          <p className="lead">
            {phase === "count" && count <= 2
              ? lang === "bn"
                ? `${sceneLabel[current.scene].bn}। মারা গেলেন।`
                : `${sceneLabel[current.scene].en}. They died.`
              : idle === "walk"
                ? lang === "bn"
                  ? "হাঁটছিলেন।"
                  : "Walking."
                : lang === "bn"
                  ? "গাছের নিচে বসে ছিলেন।"
                  : "Sitting under a tree."}
          </p>
          {phase === "idle" ? (
            <Button type="button" variant="outline" className="retro-btn pair-btn" onClick={beginCount}>
              {lang === "bn" ? "চলুন" : "Go"}
            </Button>
          ) : null}
        </section>
      ) : null}

      {current && phase === "card" ? (
        <section>
          <p className="lead">{familyLine(current, lang)}</p>
          <div className="pair">
            <Button type="button" variant="outline" className="retro-btn pair-btn" onClick={() => setReportOpen(true)}>
              {lang === "bn" ? "খবর" : "The news"}
            </Button>
            <Button type="button" className="retro-btn pair-btn" onClick={replay}>
              {lang === "bn" ? "আরেকটি দেখুন" : "See another"}
            </Button>
          </div>
          {current.amountBdt != null ? (
            <p className="sub">
              {lang === "bn" ? `${toBnDigits(String(seen.length))}টি খবর দেখা হয়েছে` : `${seen.length} stories seen`}
            </p>
          ) : null}
          {!reportOpen ? <ShareActions row={current} lang={lang} /> : null}
          <CaseDialog
            row={current}
            open={reportOpen}
            onOpenChange={setReportOpen}
            lang={lang}
            onReplay={replay}
          />
        </section>
      ) : null}
    </main>
  );
}

function CaseDialog({
  row,
  open,
  onOpenChange,
  lang,
  onReplay,
}: {
  row: CaseRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lang: Lang;
  onReplay: () => void;
}) {
  const name = lang === "bn" ? row.nameBn : row.nameEn;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogTitle>{name ?? (lang === "bn" ? "খবর" : "The news")}</DialogTitle>
          <DialogDescription>{familyLine(row, lang)}</DialogDescription>
          <CaseFacts row={row} lang={lang} />
          <ShareActions row={row} lang={lang} />
          <div className="pair">
            <Button type="button" className="retro-btn pair-btn" onClick={onReplay}>
              {lang === "bn" ? "আরেকটি দেখুন" : "See another"}
            </Button>
            <DialogClose className="pair-btn">{lang === "bn" ? "বন্ধ" : "Close"}</DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}

function EmptyPool({ lang }: { lang: Lang }) {
  return (
    <section>
      <p className="name">
        {lang === "bn" ? "সব খবর দেখা হয়ে গেছে।" : "You have seen every story."}
      </p>
      <p className="lead">
        {lang === "bn" ? "দেখা খবর আর আসবে না।" : "Seen stories do not come back."}
      </p>
    </section>
  );
}
