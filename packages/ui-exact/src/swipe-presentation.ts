import { swipeActionsStyles as s } from "@lenso/tokens/swipe-actions";
import type { StyleInput } from "./style-types.js";
const parts = new Map<string, StyleInput>([
  ["swipe-root", [s.root]],
  ["swipe-request", []],
  ["swipe-content", [s.content]],
  ["swipe-body", [s.body]],
  ["swipe-trigger", [s.trigger]],
]);
export const swipeKinds = [...parts.keys()];
export function swipePresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "swipe-actions") {
    const side = data["lensoSide"];
    if (side !== "start" && side !== "end") throw new RangeError(`Unknown swipe side: ${side}`);
    return [s.actions, side === "start" ? s.start : s.end];
  }
  if (kind === "swipe-action") {
    const variant = data["lensoVariant"];
    if (variant !== "default" && variant !== "danger" && variant !== "tint")
      throw new RangeError(`Unknown swipe variant: ${variant}`);
    return [s.action, variant === "danger" && s.danger, variant === "tint" && s.tint];
  }
  return parts.get(kind);
}
