"use client";

import Script from "next/script";

const TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN?.trim() ?? "";

type ZarazWindow = Window & {
  zaraz?: {
    track: (name: string, properties?: Record<string, string>) => void;
  };
};

/** Cookieless Cloudflare Web Analytics. No token, no beacon. */
export function CfBeacon() {
  if (!TOKEN) return null;
  return (
    <Script
      id="cf-beacon"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      type="module"
      data-cf-beacon={JSON.stringify({ token: TOKEN })}
    />
  );
}

/** Zaraz custom events. No-op until the zone injects Zaraz. */
export function track(name: string, properties?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const zaraz = (window as ZarazWindow).zaraz;
  if (!zaraz || typeof zaraz.track !== "function") return;
  try {
    zaraz.track(name, properties);
  } catch {
    return;
  }
}
