import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const toolbarStyles = stylex.create({
  root: {
    display: "grid",
    width: "fit-content",
    gridAutoFlow: "column",
    alignItems: "center",
    gap: 8,
  },
  vertical: { gridAutoFlow: "row", alignItems: "start", justifyContent: "start" },
  attached: {
    borderRadius: tokens.radius3xl,
    backgroundColor: tokens.surface,
    padding: 4,
    boxShadow: tokens.shadowOverlay,
  },
  group: { display: "inline-flex", gap: 8 },
  separator: { backgroundColor: tokens.separator, flexShrink: 0 },
  separatorHorizontal: { width: "50%", justifySelf: "center" },
  separatorVertical: { height: "50%", alignSelf: "center" },
  horizontalLine: { width: "50%", height: 1, justifySelf: "center" },
  verticalLine: { width: 1, height: "50%", alignSelf: "center" },
});
