import * as stylex from "@stylexjs/stylex";
import { pageControlStyles as s } from "@lenso/tokens/page-control";
import { glassStyles } from "@lenso/tokens/glass";
import type { StyleInput } from "./style-types.js";

const native = stylex.create({
  button: { "--exact-hover-wash": "none", "--exact-hover-dim": "1", backgroundImage: "none" },
  request: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    borderWidth: 0,
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
    pointerEvents: "none",
  },
});
export const pageControlKinds = ["page-control", "page-control-request"];
export function pageControlPresentation(kind: string, data: DOMStringMap): StyleInput | undefined {
  if (kind === "page-control") return [s.root];
  if (kind === "page-control-request") return [native.request];
  if (kind === "page-control-dot")
    return [
      s.dot,
      data["lensoActive"] === "true" && s.active,
      data["lensoOverflow"] === "true" && s.overflow,
    ];
  if (kind === "page-control-item")
    return [
      s.button,
      data["lensoCount"] === "7" && s.sevenButton,
      data["lensoEdge"] === "true" && s.edgeButton,
      native.button,
    ];
  if (kind !== "page-control-track") return;
  const prominent = data["lensoVariant"] === "prominent";
  if (!prominent && data["lensoVariant"] !== "plain")
    throw new RangeError(`Unknown Lenso PageControl variant: ${data["lensoVariant"]}`);
  return [
    prominent && glassStyles.root,
    prominent && glassStyles.optics,
    prominent && glassStyles.foreground,
    prominent && glassStyles.hotspot,
    s.track,
    data["lensoCount"] === "7" && s.sevenTrack,
    !prominent && s.plainTrack,
  ];
}
