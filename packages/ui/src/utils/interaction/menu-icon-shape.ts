import { sampleMenu, menuDurations, type MenuPose } from "./menu-shape.js";
import { sampleMenuSourceReturn } from "./menu-curves.js";

export const iconMenuDurations = menuDurations;
const clamp = (n: number) => Math.max(0, Math.min(1, n));

/** Shared whole-panel contraction; only the circular source's return is uniform. */
export function sampleIconMenu(
  time: number,
  open: boolean,
  from: { width: number; height: number; x: number; y: number },
  to: { width: number; height: number },
  radius: number,
): MenuPose {
  const base = sampleMenu(time, open, from, to, radius, true);
  if (open)
    return {
      ...base,
      glyph: time < 39 ? 1 - (time / 39) * 0.847 : 0.153 * clamp(1 - (time - 39) / 24),
    };
  if (time < 299) return { ...base, glyph: 0 };
  const source = sampleMenuSourceReturn(time, from.height);
  const direction = to.height / 2 >= from.y + from.height / 2 ? 1 : -1;
  const width = from.width * source.scale,
    height = from.height * source.scale;
  const lift = source.lift * direction;
  return {
    ...base,
    width,
    height,
    left: from.x + (from.width - width) / 2,
    top: from.y + (from.height - height) / 2 + lift,
    corner: Math.min(width, height) / 2,
    triggerScale: source.scale,
    triggerLift: lift,
  };
}
