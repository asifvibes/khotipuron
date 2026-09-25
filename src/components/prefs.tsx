"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { track } from "@/components/analytics";
import { Button } from "@/components/ui/button";
import { LANG_KEY, THEME_KEY } from "@/data/logic";
import type { Lang } from "@/data/types";

export type Theme = "dark" | "light";

export function usePrefs() {
  const [lang, setLang] = useState<Lang>("bn");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const nextLang: Lang = localStorage.getItem(LANG_KEY) === "en" ? "en" : "bn";
    const nextTheme: Theme = localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    setLang(nextLang);
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.lang = nextLang === "en" ? "en" : "bn";
  }, []);

  function toggleLang() {
    const next: Lang = lang === "bn" ? "en" : "bn";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
    document.documentElement.lang = next === "en" ? "en" : "bn";
    track("language_toggle", { lang: next });
  }

  function chooseTheme(next: Theme) {
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.dataset.theme = next;
    track("theme_toggle", { theme: next });
  }

  return { lang, theme, toggleLang, chooseTheme };
}

export function TopBar({
  lang,
  theme,
  onLang,
  onTheme,
  nav,
  onHome,
  homeHref = "/",
  onMarkClick,
}: {
  lang: Lang;
  theme: Theme;
  onLang: () => void;
  onTheme: (next: Theme) => void;
  nav: "game" | "method";
  onHome?: () => void;
  homeHref?: string;
  onMarkClick?: () => void;
}) {
  const mark = lang === "bn" ? "ক্ষতিপূরণ" : "Khotipuron";
  return (
    <header className="top">
      {onHome ? (
        <button type="button" className="mark" onClick={onHome}>
          {mark}
        </button>
      ) : (
        <Link href={homeHref} className="mark" onClick={onMarkClick}>
          {mark}
        </Link>
      )}
      <div className="controls">
        <Button type="button" variant="outline" className="retro-btn settings-btn" onClick={onLang}>
          {lang === "bn" ? "English" : "বাংলা"}
        </Button>
        <button
          type="button"
          className="icon-btn"
          aria-label={theme === "dark" ? (lang === "bn" ? "আলো" : "Light") : lang === "bn" ? "কালো" : "Dark"}
          onClick={() => onTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
        <Link
          href="/method"
          className={nav === "method" ? "nav-link is-current" : "nav-link"}
          aria-current={nav === "method" ? "page" : undefined}
          onClick={() => track("info_open")}
        >
          <InfoIcon />
          <span>{lang === "bn" ? "তথ্য" : "Info"}</span>
        </Link>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M15.5 3.2A8.2 8.2 0 1 0 20.8 14 6.6 6.6 0 0 1 15.5 3.2z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
      <path fill="currentColor" d="M11 10.5h2V17h-2zM11 7h2v2h-2z" />
    </svg>
  );
}
