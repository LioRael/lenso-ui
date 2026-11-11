import { prefersReducedMotion } from "@lenso/glass/motion";
import { menuDurations, type MenuPose } from "./menu-shape.js";

// Corrections carry every channel through a reversal; a nearest-height restart loses width and velocity.
export function createMenuTimeline(
  sample: (time: number, open: boolean) => MenuPose,
  paint: (pose: MenuPose, settled: boolean, open: boolean) => void,
  durations = menuDurations,
) {
  let open = false,
    frame = 0,
    stopped = false,
    started = 0,
    duration = 0;
  let current = sample(durations.closing, false);
  let previousTime = 0;
  let velocityFrom = current,
    velocityTo = current,
    velocityInterval = 0;
  let correction: { offset: MenuPose; drift: MenuPose } | undefined;
  const keys = Object.keys(current) as (keyof MenuPose)[];
  const tick = (time: number) => {
    frame = 0;
    const elapsed = Math.min(duration, Math.max(0, time - started));
    const pose = sample(elapsed, open);
    if (correction && elapsed < 120) {
      const t = elapsed / 120,
        h0 = 2 * t * t * t - 3 * t * t + 1,
        h1 = t * t * t - 2 * t * t + t;
      for (const key of keys)
        pose[key] += correction.offset[key] * h0 + correction.drift[key] * 120 * h1;
    }
    const dt = time - previousTime;
    // Consecutive reversals can share a timestamp. Keep the last pair with a measurable interval.
    if (dt > 0) {
      velocityFrom = current;
      velocityTo = pose;
      velocityInterval = dt;
    }
    current = pose;
    previousTime = time;
    const settled = elapsed === duration;
    paint(current, settled, open);
    if (!settled && !stopped) frame = requestAnimationFrame(tick);
  };
  const set = (target: number, instant = false) => {
    if (stopped) return;
    const next = target === 1;
    const moving = frame !== 0;
    if (next === open && !moving) instant = true;
    if (frame) cancelAnimationFrame(frame);
    open = next;
    duration = open ? durations.opening : durations.closing;
    if (instant || document.hidden || prefersReducedMotion()) {
      frame = 0;
      current = sample(duration, open);
      velocityInterval = 0;
      correction = undefined;
      paint(current, true, open);
      return;
    }
    if (moving) {
      const first = sample(0, open),
        after = sample(1, open);
      const offset = { ...current },
        drift = { ...current };
      for (const key of keys) {
        offset[key] = current[key] - first[key];
        const velocity = velocityInterval
          ? (velocityTo[key] - velocityFrom[key]) / velocityInterval
          : 0;
        drift[key] = velocity - (after[key] - first[key]);
      }
      correction = { offset, drift };
    } else correction = undefined;
    started = previousTime = performance.now();
    tick(started);
  };
  const visibility = () => {
    if (document.hidden) set(open ? 1 : 0, true);
  };
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => {
    if (media.matches) set(open ? 1 : 0, true);
  };
  document.addEventListener("visibilitychange", visibility);
  media.addEventListener("change", reduced);
  return {
    set,
    paint: () => paint(current, !frame, open),
    stop() {
      stopped = true;
      cancelAnimationFrame(frame);
      frame = 0;
      document.removeEventListener("visibilitychange", visibility);
      media.removeEventListener("change", reduced);
    },
  };
}
