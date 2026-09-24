import type { SceneType } from "@/data/types";

type Idle = "walk" | "sit";
type Phase = "idle" | "death";

const PX = 5;

const INK: Record<string, string> = {
  h: "#6b3e22",
  s: "#f3d2b0",
  e: "#1b1712",
  t: "#e2b657",
  p: "#1d3550",
  b: "#111111",
};

const WALK_A = ["..hhhhh..", ".hhhhhhh.", ".hsesssh.", ".hsssssh.", "..sssss..", ".ttttttt.", "ttttttttt", ".ttttttt.", "..p...p..", "..p...p..", "..b...b.."];
const WALK_B = ["..hhhhh..", ".hhhhhhh.", ".hsesssh.", ".hsssssh.", "..sssss..", ".ttttttt.", "ttttttttt", ".ttttttt.", ".p.....p.", ".p.....p.", "b.......b"];
const SIT = ["..hhhhh..", ".hhhhhhh.", ".hsesssh.", ".hsssssh.", "..sssss..", ".ttttttt.", "ttttttttt", ".ttttttt.", "ppppppppp", ".bbbbbbb."];

function Sprite({ art, className }: { art: string[]; className: string }) {
  return (
    <span className={`sprite ${className}`}>
      {art.flatMap((row, y) =>
        [...row].flatMap((cell, x) =>
          cell === "." ? [] : [<i key={`${className}-${x}-${y}`} style={{ left: x * PX, top: y * PX, background: INK[cell] }} />],
        ),
      )}
    </span>
  );
}

export function Scene({
  idle,
  phase,
  scene,
  rush = false,
  hit = false,
  countLabel = null,
}: {
  idle: Idle;
  phase: Phase;
  scene: SceneType;
  rush?: boolean;
  hit?: boolean;
  countLabel?: string | null;
}) {
  return (
    <div
      className={`stage ${idle} ${phase === "death" ? "death" : ""} ${rush ? "rush" : ""} ${hit ? "hit" : ""}`}
      data-scene={scene}
      aria-hidden="true"
    >
      <div className="sky" />
      <div className="tree">
        <i />
        <b />
      </div>
      <div className="ground" />
      {scene === "road" || phase === "idle" ? <div className="lane" /> : null}
      <div className="person">
        <Sprite art={WALK_A} className="step-a" />
        <Sprite art={WALK_B} className="step-b" />
        <Sprite art={SIT} className="sit-pose" />
      </div>
      <div className="hazard" />
      <div className="scan" />
      {countLabel ? (
        <p className="count" key={countLabel}>
          {countLabel}
        </p>
      ) : null}
    </div>
  );
}
