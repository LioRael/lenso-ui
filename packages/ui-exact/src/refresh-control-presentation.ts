import * as stylex from "@stylexjs/stylex";
import { refreshControlStyles as s } from "@lenso/tokens/refresh-control";
import type { StyleInput } from "./style-types.js";
const native = stylex.create({
  trigger: { boxSizing: "border-box" },
  indicator: {
    transform: {
      default: "translateY(-56px)",
      ':is([data-lenso-mode="refreshing"] *)': "translateY(0px)",
    },
    opacity: { default: 0, ':is([data-lenso-mode="refreshing"] *)': 1 },
  },
  content: {
    transform: {
      default: "translateY(0px)",
      ':is([data-lenso-mode="refreshing"] *)': "translateY(56px)",
    },
    // StyleX replaces earlier conditional values for this property; keep source timing and drag overrides together.
    transitionDuration: {
      default: "180ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
      ':is([data-state="pulling"] *, [data-state="armed"] *)': "0ms",
    },
  },
  progress: {
    display: { default: "inline-block", ':is([hidden], [data-lenso-active="false"])': "none" },
  },
  hidden: { display: { default: "block", ':is([hidden], [data-lenso-active="false"])': "none" } },
});
const parts = new Map<string, StyleInput>([
  ["refresh-control", [s.root]],
  ["refresh-control-trigger", [s.trigger, native.trigger]],
  ["refresh-control-viewport", [s.viewport]],
  ["refresh-control-content", [s.content, native.content]],
  ["refresh-control-indicator", [s.indicator, native.indicator]],
  ["refresh-control-progress", [s.progress, native.progress]],
  ["refresh-control-spinner", [native.hidden]],
  ["refresh-control-message", []],
  ["refresh-control-status", [s.srOnly]],
  ["refresh-control-error", [s.error, native.hidden]],
]);
export const refreshKinds = [...parts.keys()];
export function refreshPresentation(kind: string): StyleInput | undefined {
  return parts.get(kind);
}
