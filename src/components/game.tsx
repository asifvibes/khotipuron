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

export function Game() {
  const { lang, theme, toggleLang, toggleTheme } = usePrefs();
  const [phase, setPhase] = useState<Phase>("loading");
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

  return (
    <main className="shell">
      <TopBar lang={lang} theme={theme} onLang={toggleLang} onTheme={toggleTheme} nav="game" />

      {phase === "loading" ? <p className="lead">…</p> : null}
      {phase === "empty" ? <EmptyPool lang={lang} /> : null}

      {current && phase !== "loading" && phase !== "empty" ? (
        <Scene idle={idle} phase={phase === "idle" ? "idle" : "death"} scene={current.scene} />
      ) : null}

      {current && (phase === "idle" || phase === "death") ? (
        <section>
          <p className="lead">
            {phase === "idle"
              ? idle === "walk"
                ? lang === "bn"
                  ? "হাঁটছিলেন।"
                  : "Walking."
                : lang === "bn"
                  ? "গাছের নিচে বসে ছিলেন।"
                  : "Sitting under a tree."
              : lang === "bn"
                ? `${sceneLabel[current.scene].bn}। মারা গেলেন।`
                : `${sceneLabel[current.scene].en}. They died.`}
          </p>
          <Button type="button" variant="outline" className="retro-btn" onClick={skipWait}>
            {lang === "bn" ? "চলুন" : "Next"}
          </Button>
        </section>
      ) : null}

      {current && phase === "card" ? (
        <section>
          <p className="lead">{familyLine(current, lang)}</p>
          <div className="replay-row">
            <Button type="button" variant="outline" className="retro-btn" onClick={() => setReportOpen(true)}>
              {lang === "bn" ? "খবর" : "The news"}
            </Button>
            <Button type="button" className="retro-btn" onClick={replay}>
              {lang === "bn" ? "আরেকটা" : "Another"}
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
          <div className="replay-row">
            <Button type="button" className="retro-btn" onClick={onReplay}>
              {lang === "bn" ? "আরেকটা" : "Another"}
            </Button>
            <DialogClose>{lang === "bn" ? "বন্ধ" : "Close"}</DialogClose>
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
