"use client";

import { useState } from "react";
import { publicCaseUrl, shareText } from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

export function ShareActions({ row, lang }: { row: CaseRow; lang: Lang }) {
  const [hint, setHint] = useState<"ig" | "copied" | null>(null);
  const [copyByHand, setCopyByHand] = useState(false);
  const url = publicCaseUrl(row.id);
  const text = shareText(row, lang);
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
  const bn = lang === "bn";

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyByHand(false);
      return true;
    } catch {
      setCopyByHand(true);
      return false;
    }
  }

  async function onInstagram() {
    await copyUrl();
    setHint("ig");
  }

  async function onCopy() {
    const ok = await copyUrl();
    setHint(ok ? "copied" : "copied");
  }

  return (
    <div className="share-block">
      <div className="share-row">
        <a className="icon-btn" href={facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
          <FacebookIcon />
        </a>
        <button type="button" className="icon-btn" onClick={onInstagram} aria-label="Instagram">
          <InstagramIcon />
        </button>
        <a className="icon-btn" href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
          <LinkedInIcon />
        </a>
        <a className="icon-btn" href={whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
          <WhatsAppIcon />
        </a>
        <button type="button" className="icon-btn" onClick={onCopy} aria-label={bn ? "লিংক কপি" : "Copy link"}>
          <CopyIcon />
        </button>
      </div>
      {hint === "ig" ? <p className="share-note">{bn ? "ইনস্টাগ্রামে পেস্ট করুন।" : "Paste it in Instagram."}</p> : null}
      {hint === "copied" ? <p className="share-note">{bn ? "কপি হয়েছে।" : "Copied."}</p> : null}
      {copyByHand ? (
        <input className="copy-fallback" readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      ) : null}
    </div>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14.2 20v-7.1h2.4l.4-2.8h-2.8V8.4c0-.8.2-1.4 1.4-1.4H17V4.5c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v2.1H8.8v2.8h2.6V20h2.8z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1" fill="currentColor" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M6.5 9.2H3.7V20h2.8V9.2zM5.1 4C4.1 4 3.3 4.8 3.3 5.8S4.1 7.6 5.1 7.6 6.9 6.8 6.9 5.8 6.1 4 5.1 4zM20.3 20h-2.8v-5.6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20h-2.8V9.2h2.8v1.5c.4-.7 1.3-1.8 3.2-1.8 2.3 0 4 1.5 4 4.8V20z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.1 3.5A8.4 8.4 0 0 0 5.2 16.3L4 20.5l4.3-1.1A8.4 8.4 0 1 0 12.1 3.5zm4.9 11.9c-.2.6-1.2 1.1-1.6 1.1-.4.1-.9.2-3-.7-2.5-1-4.1-3.6-4.2-3.8-.1-.2-1-1.3-1-2.5s.6-1.8.9-2c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .5.4.2.6.7 2 .7 2.1.1.1.1.3 0 .4-.1.2-.2.3-.3.5l-.3.3c-.1.1-.2.3-.1.5.2.3.7 1.2 1.6 1.9 1.1.9 2 1.1 2.3 1.3.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3.1.3 0 .8-.2 1.1z"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="7" width="11" height="13" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M5 16V4h11" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
