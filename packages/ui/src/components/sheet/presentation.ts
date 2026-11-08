import type { Drawer } from "@base-ui/react/drawer";

type SnapPoint = Drawer.Root.SnapPoint;

export interface SheetPresentationPoint {
  height: number;
  attached: boolean;
}

export function resolvePresentationPoints(
  snapPoints: readonly SnapPoint[],
  attached: readonly SnapPoint[],
  viewportHeight: number,
  popupHeight: number,
  rootFontSize: number,
): SheetPresentationPoint[] {
  if (viewportHeight <= 0 || popupHeight <= 0) return [];
  const points: SheetPresentationPoint[] = [];
  for (const point of [...snapPoints].reverse()) {
    const height =
      typeof point === "number"
        ? point <= 1
          ? point * viewportHeight
          : point
        : point.trim().endsWith("rem")
          ? Number.parseFloat(point) * rootFontSize
          : point.trim().endsWith("px")
            ? Number.parseFloat(point)
            : Number.NaN;
    if (!Number.isFinite(height)) continue;
    const resolved = Math.max(0, Math.min(height, popupHeight, viewportHeight));
    if (points.some((existing) => Math.abs(existing.height - resolved) <= 1)) continue;
    points.push({ height: resolved, attached: attached.includes(point) });
  }
  return points.sort((a, b) => a.height - b.height);
}

export function sheetPresentationAt(points: readonly SheetPresentationPoint[], height: number) {
  const first = points[0];
  if (!first) return { floating: 0, solid: 0 };
  const last = points[points.length - 1]!;
  const appearance = (point: SheetPresentationPoint) => ({
    floating: point.attached ? 0 : 1,
    solid: point === last && point.attached && points.length > 1 ? 1 : 0,
  });
  if (height <= first.height) return appearance(first);
  for (let index = 1; index < points.length; index += 1) {
    const right = points[index]!;
    if (height > right.height) continue;
    const left = points[index - 1]!;
    const distance = (height - left.height) / (right.height - left.height);
    // Zero slope at each detent avoids a corner/material velocity change
    // when the same sheet passes through its floating middle stop.
    const progress = distance * distance * (3 - 2 * distance);
    const from = appearance(left);
    const to = appearance(right);
    return {
      floating: from.floating + (to.floating - from.floating) * progress,
      solid: from.solid + (to.solid - from.solid) * progress,
    };
  }
  return appearance(last);
}
