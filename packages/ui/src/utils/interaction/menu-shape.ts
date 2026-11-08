// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. SPDX-License-Identifier: MIT.
// Shape samples adapted from onlymoein/liquidglass 89f8b736.
// Modified: normalized reversible sampling; Base UI retains placement and lifecycle.
import {
  menuInk,
  sampleMenuOpening,
  sampleMenuClosing,
  sampleMenuSourceReturn,
} from "./menu-curves.js";
type Row = readonly [width: number, height: number, centre: number, zoom: number, round: number];
const opening: readonly Row[] = [
  [0, 0, 0, 0.7, 1],
  [-0.43, 0, 0.01, 0.7, 1],
  [-1.28, 0.04, 0.15, 0.7, 1],
  [-1.48, 0.435, 0.73, 0.75, 1],
  [-1.22, 0.53, 0.88, 0.85, 1],
  [-0.97, 0.6, 1, 0.95, 1],
  [-0.52, 0.73, 1.2, 1.08, 1],
  [-0.14, 0.81, 1.33, 1.19, 1],
  [0.21, 0.88, 1.4, 1.25, 0.92],
  [0.45, 0.91, 1.4, 1.27, 0.83],
  [0.66, 0.95, 1.365, 1.28, 0.75],
  [0.8, 0.97, 1.31, 1.25, 0.66],
  [0.93, 0.99, 1.25, 1.2, 0.58],
  [1.03, 1.01, 1.2, 1.16, 0.49],
  [1.07, 1.02, 1.14, 1.12, 0.41],
  [1.1, 1.02, 1.087, 1.09, 0.32],
  [1.1, 1.02, 1.052, 1.06, 0.24],
  [1.1, 1.02, 1.035, 1.04, 0.15],
  [1.07, 1.02, 1.017, 1.03, 0.1],
  [1.07, 1.02, 1, 1.02, 0.05],
  [1.07, 1.01, 0.99, 1.01, 0.02],
  [1.03, 1.01, 0.99, 1, 0],
  [1.02, 1.01, 0.99, 1, 0],
  [1.01, 1, 0.99, 1, 0],
  [1, 1, 1, 1, 0],
];

export interface MenuPose {
  width: number;
  height: number;
  left: number;
  top: number;
  corner: number;
  zoom: number;
  opacity: number;
  items: number;
  blur: number;
  glyph: number;
  triggerOpacity: number;
  triggerScale: number;
  triggerLift: number;
  progress: number;
  refraction: number;
}
const clamp = (n: number) => Math.max(0, Math.min(1, n));
function rowAt<T extends readonly number[]>(table: readonly T[], at: number) {
  const lower = Math.min(table.length - 1, Math.floor(at));
  return table[lower]!.map(
    (n, i) => n + (table[Math.min(lower + 1, table.length - 1)]![i]! - n) * (at - lower),
  );
}
export const menuDurations = {
  opening: 442,
  closing: 533,
};
export function sampleMenu(
  time: number,
  open: boolean,
  from: { width: number; height: number; x: number; y: number },
  to: { width: number; height: number },
  radius: number,
  stableSource = false,
): MenuPose {
  const duration = open ? menuDurations.opening : menuDurations.closing;
  const at = (Math.max(0, Math.min(duration, time)) * 60) / 1000;
  if (open) {
    const row = rowAt(opening, at);
    return {
      ...sampleMenuOpening(time, from, to, radius),
      zoom: row[3]!,
      opacity: 1,
      items: clamp((at - 1) / 6),
      ...menuInk(time, true, duration),
      glyph: clamp(1 - at / 2.5),
      triggerOpacity: 0,
      triggerScale: 1,
      triggerLift: 0,
    };
  }
  const returning = time >= 299;
  const source =
    returning && !stableSource ? sampleMenuSourceReturn(time, from.height) : { scale: 1, lift: 0 };
  const direction = to.height / 2 >= from.y + from.height / 2 ? 1 : -1;
  return {
    ...sampleMenuClosing(time, from, to, radius),
    zoom: returning ? 1 : 1 - 0.18 * clamp(time / 150),
    opacity: returning ? 0 : 1,
    items: clamp(1 - at / 4),
    ...(returning ? { blur: 0, refraction: 0 } : menuInk(time, false, duration)),
    glyph: returning ? 0 : clamp((at - 5) / 3),
    triggerOpacity: returning ? 1 : 0,
    triggerScale: source.scale,
    triggerLift: source.lift * direction,
  };
}
