"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  }

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.dataset.theme = next;
  }

  return { lang, theme, toggleLang, toggleTheme };
}

export function TopBar({
  lang,
  theme,
  onLang,
  onTheme,
  nav,
}: {
  lang: Lang;
  theme: Theme;
  onLang: () => void;
  onTheme: () => void;
  nav: "game" | "method";
}) {
  return (
    <header className="top">
      <p className="mark">{lang === "bn" ? "ক্ষতিপূরণ" : "Khotipuron"}</p>
      <div className="controls">
        <Button type="button" variant="outline" className="retro-btn settings-btn" onClick={onLang}>
          {lang === "bn" ? "English" : "বাংলা"}
        </Button>
        <Button type="button" variant="outline" className="retro-btn settings-btn" onClick={onTheme}>
          {theme === "dark" ? (lang === "bn" ? "আলো" : "Light") : lang === "bn" ? "কালো" : "Dark"}
        </Button>
        {nav === "game" ? (
          <Link className="text-link" href="/method">
            {lang === "bn" ? "টাকার কথা" : "The money"}
          </Link>
        ) : (
          <Link className="text-link" href="/">
            {lang === "bn" ? "খেলা" : "Play"}
          </Link>
        )}
      </div>
    </header>
  );
}
