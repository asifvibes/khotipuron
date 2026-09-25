import Link from "next/link";
import type { Lang } from "@/data/types";

export function ChartNudge({ lang }: { lang: Lang }) {
  return (
    <p className="nudge">
      {lang === "bn" ? "সব খবর মিলিয়ে কী দাঁড়ায়, সেটা " : "What these stories add up to is on the "}
      <Link href="/method#settlement">{lang === "bn" ? "ইনফো পেজে" : "info page"}</Link>
      {lang === "bn" ? "।" : "."}
    </p>
  );
}
