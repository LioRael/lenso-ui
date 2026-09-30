/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const rangeCalendarStyles = stylex.create({
  root: { position: "relative", width: 252, maxWidth: 252, containerType: "inline-size" },
  cell: {
    position: "relative",
    zIndex: 1,
    marginInline: 0,
    marginBlock: 2,
    padding: 0,
    borderRadius: tokens.radius3xl,
    outline: "none",
    cursor: "pointer",
  },
  cellButton: {
    display: "flex",
    aspectRatio: "1 / 1",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.radius3xl,
    fontSize: 14,
    fontWeight: 500,
    color: tokens.foreground,
  },
  raised: { zIndex: 2 },
  pressed: { scale: ".9" },
  rowEdges: {
    borderStartStartRadius: {
      default: 0,
      ":is(td:first-child > *,[aria-disabled] + td > *,td:has(> [data-outside-month='true']) + td > *)":
        tokens.radiusLg,
    },
    borderEndStartRadius: {
      default: 0,
      ":is(td:first-child > *,[aria-disabled] + td > *,td:has(> [data-outside-month='true']) + td > *)":
        tokens.radiusLg,
    },
    borderStartEndRadius: {
      default: 0,
      ":is(td:last-child > *,td:has(+ [aria-disabled]) > *,td:has(+ td > [data-outside-month='true']) > *)":
        tokens.radiusLg,
    },
    borderEndEndRadius: {
      default: 0,
      ":is(td:last-child > *,td:has(+ [aria-disabled]) > *,td:has(+ td > [data-outside-month='true']) > *)":
        tokens.radiusLg,
    },
  },
});
