import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
import { focusRing } from "../../focus-ring.stylex.const.js";
export const sectionIndexStyles = stylex.create({
  root: {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "stretch",
    width: 44,
    maxWidth: "100%",
    position: "relative",
    paddingBlock: 4,
    borderRadius: 22,
    fontFamily: tokens.fontBody,
    touchAction: "none",
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTouchCallout: "none",
  },
  item: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "end",
    width: 16,
    position: "relative",
    minHeight: 13.8,
    paddingInline: 0,
    borderRadius: 12,
    color: {
      default: `light-dark(${tokens.tintText}, ${tokens.tint})`,
      ":is([aria-disabled='true'])": tokens.labelTertiary,
    },
    backgroundColor: "transparent",
    fontSize: "0.6875rem",
    lineHeight: "0.8625rem",
    fontWeight: 600,
    textDecoration: "none",
    outlineStyle: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
    WebkitTapHighlightColor: "transparent",
  },
  disabled: { opacity: 0.4 },
});
