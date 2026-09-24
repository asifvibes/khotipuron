"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { publicCaseUrl, shareText } from "@/data/logic";
import type { CaseRow, Lang } from "@/data/types";

export function ShareActions({ row, lang }: { row: CaseRow; lang: Lang }) {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyByHand, setCopyByHand] = useState(false);
  const url = publicCaseUrl(row.id);
  const text = shareText(row, lang);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function onShare() {
    if (!navigator.share) return;
    try {
      await navigator.share({ text, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyByHand(false);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyByHand(true);
    }
  }

  return (
    <div className="share-row">
      {canShare ? (
        <Button type="button" className="retro-btn" onClick={onShare}>
          {lang === "bn" ? "শেয়ার" : "Share"}
        </Button>
      ) : null}
      <a className="retro-btn share-link" href={whatsapp} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
      <Button type="button" variant="outline" className="retro-btn" onClick={onCopy}>
        {copied ? (lang === "bn" ? "কপি হয়েছে" : "Copied") : lang === "bn" ? "লিংক কপি" : "Copy link"}
      </Button>
      {copyByHand ? (
        <input className="copy-fallback" readOnly value={url} onFocus={(event) => event.currentTarget.select()} />
      ) : null}
    </div>
  );
}
