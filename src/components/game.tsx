"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CaseFacts } from "@/components/case-facts";
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
import { familyLine, LANG_KEY, pickUnseen, sceneLabel, SEEN_KEY, toBnDigits } from "@/data/logic";
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
    const storedLang = readLang();
    const seenIds = new Set(storedSeen);
    if (from && cases.some((row) => row.id === from)) seenIds.add(from);
    const nextSeen = [...seenIds];
    if (from && nextSeen.length !== storedSeen.length) {
      localStorage.setItem(SEEN_KEY, JSON.stringify(nextSeen));
    }
    setSeen(nextSeen);
    setLang(storedLang);
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

  function toggleLang() {
    const next: Lang = lang === "bn" ? "en" : "bn";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  }

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

  const primary = lang;
  const secondary: Lang = lang === "bn" ? "en" : "bn";

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
            {primary === "bn" ? "পদ্ধতি" : "Method"}
          </Link>
        </div>
      </header>

      {phase === "loading" ? <p className="lead">…</p> : null}
      {phase === "empty" ? <EmptyBoth /> : null}

      {current && phase !== "loading" && phase !== "empty" ? (
        <Scene idle={idle} phase={phase === "idle" ? "idle" : "death"} scene={current.scene} />
      ) : null}

      {current && (phase === "idle" || phase === "death") ? (
        <section>
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
        <section>
          <p className="lead">{familyLine(current, primary)}</p>
          <p className="sub">{familyLine(current, secondary)}</p>
          <div className="replay-row">
            <Button type="button" variant="outline" className="retro-btn" onClick={() => setReportOpen(true)}>
              {primary === "bn" ? "প্রতিবেদন" : "The report"}
            </Button>
            <Button type="button" className="retro-btn" onClick={replay}>
              {primary === "bn" ? "আরেকটি" : "Another"}
            </Button>
          </div>
          {current.amountBdt != null ? (
            <p className="sub">
              {primary === "bn" ? `${toBnDigits(String(seen.length))}টি দেখা হয়েছে` : `${seen.length} seen`}
            </p>
          ) : null}
          {!reportOpen ? <ShareActions row={current} lang={primary} /> : null}
          <CaseDialog
            row={current}
            open={reportOpen}
            onOpenChange={setReportOpen}
            primary={primary}
            secondary={secondary}
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
  primary,
  secondary,
  onReplay,
}: {
  row: CaseRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primary: Lang;
  secondary: Lang;
  onReplay: () => void;
}) {
  const name = primary === "bn" ? row.nameBn : row.nameEn;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup>
          <DialogTitle>{name ?? (primary === "bn" ? "প্রতিবেদন" : "The report")}</DialogTitle>
          <DialogDescription>{familyLine(row, primary)}</DialogDescription>
          <CaseFacts row={row} primary={primary} secondary={secondary} />
          <ShareActions row={row} lang={primary} />
          <div className="replay-row">
            <Button type="button" className="retro-btn" onClick={onReplay}>
              {primary === "bn" ? "আরেকটি" : "Another"}
            </Button>
            <DialogClose>{primary === "bn" ? "বন্ধ" : "Close"}</DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}

function EmptyBoth() {
  return (
    <section>
      <p className="name">এই ফাইলের সব ঘটনা আপনি দেখে ফেলেছেন।</p>
      <p className="lead">পুরনো ঘটনা আবার দেখানো হচ্ছে না।</p>
      <p className="sub">You have seen every case in this file. Seen cases are not shown again.</p>
    </section>
  );
}
