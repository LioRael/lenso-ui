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
    minHeight: 24,
    paddingInline: 4,
    borderRadius: 12,
    color: {
      default: `color-mix(in srgb, ${tokens.link} 75%, ${tokens.labelPrimary})`,
      ":is([aria-disabled='true'])": tokens.labelTertiary,
    },
    backgroundColor: { default: "transparent", ":is([aria-current])": tokens.fillTertiary },
    fontSize: "0.6875rem",
    lineHeight: "1rem",
    fontWeight: 600,
    textDecoration: "none",
    outlineStyle: "none",
    boxShadow: { default: "none", ":focus-visible": focusRing.outer },
    WebkitTapHighlightColor: "transparent",
  },
  disabled: { opacity: 0.4 },
});
