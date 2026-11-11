import * as stylex from "@stylexjs/stylex";
import { scrollShadowStyles as s } from "@lenso/tokens/scroll-shadow";
import type { StyleInput } from "./style-types.js";
export { scrollShadowProperties } from "@lenso/tokens/scroll-shadow";

const native = stylex.create({
  geometry: {
    "--scroll-shadow-size": "var(--lenso-exact-scroll-size, 40px)",
    "--scroll-shadow-offset": "var(--lenso-exact-scroll-offset, 0px)",
    "--scroll-shadow-observed-before": "0px",
    "--scroll-shadow-observed-after": "0px",
  },
  before: { "--scroll-shadow-observed-before": "var(--lenso-exact-scroll-size, 40px)" },
  after: { "--scroll-shadow-observed-after": "var(--lenso-exact-scroll-size, 40px)" },
  rtl: {
    maskImage: {
      default:
        "linear-gradient(270deg, transparent 0, #000 var(--scroll-shadow-before), #000 calc(100% - var(--scroll-shadow-after)), transparent 100%), linear-gradient(#000, #000)",
      ":dir(rtl)":
        "linear-gradient(270deg, transparent 0, #000 var(--scroll-shadow-before), #000 calc(100% - var(--scroll-shadow-after)), transparent 100%), linear-gradient(#000, #000)",
    },
  },
  ltr: {
    maskImage: {
      default:
        "linear-gradient(90deg, transparent 0, #000 var(--scroll-shadow-before), #000 calc(100% - var(--scroll-shadow-after)), transparent 100%), linear-gradient(#000, #000)",
      ":dir(rtl)":
        "linear-gradient(90deg, transparent 0, #000 var(--scroll-shadow-before), #000 calc(100% - var(--scroll-shadow-after)), transparent 100%), linear-gradient(#000, #000)",
    },
  },
  report: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    pointerEvents: "none",
  },
});
export const scrollShadowKinds = ["scroll-shadow-report"];
export function scrollShadowPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "scroll-shadow-report") return [native.report];
  if (kind !== "scroll-shadow") return;
  const orientation = data["orientation"];
  if (orientation !== "vertical" && orientation !== "horizontal")
    throw new RangeError(`Unknown Lenso ScrollShadow orientation: ${orientation}`);
  const visibility = data["lensoVisibility"];
  if (!["auto", "both", "top", "bottom", "left", "right", "none"].includes(visibility ?? ""))
    throw new RangeError(`Unknown Lenso ScrollShadow visibility: ${visibility}`);
  const automatic = data["lensoEnabled"] === "true" && visibility === "auto";
  const before = data["lensoScrollBefore"] === "true",
    after = data["lensoScrollAfter"] === "true";
  return [
    s.root,
    s[orientation],
    data["lensoHideScrollbar"] === "true" && s.hideScrollBar,
    (automatic || before || after) &&
      (orientation === "vertical" ? s.verticalMask : s.horizontalMask),
    (automatic || before || after) &&
      orientation === "horizontal" &&
      (data["lensoDirection"] === "rtl" ? native.rtl : native.ltr),
    native.geometry,
    before && native.before,
    after && native.after,
    automatic && s.automatic,
    automatic && (orientation === "vertical" ? s.verticalTimeline : s.horizontalTimeline),
    automatic && data["lensoScrollOverflow"] === "false" && s.inactive,
  ];
}
