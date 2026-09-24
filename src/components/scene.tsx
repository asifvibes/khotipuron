import type { SceneType } from "@/data/types";

type Idle = "walk" | "sit";
type Phase = "idle" | "death";

export function Scene({
  idle,
  phase,
  scene,
}: {
  idle: Idle;
  phase: Phase;
  scene: SceneType;
}) {
  return (
    <div
      className={`stage ${phase === "idle" ? idle : "death"}`}
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
        <span className="head" />
        <span className="torso" />
        <span className="legs" />
      </div>
      <div className="hazard" />
      <div className="scan" />
    </div>
  );
}
