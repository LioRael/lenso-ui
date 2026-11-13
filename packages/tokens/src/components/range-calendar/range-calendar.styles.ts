// Copyright NextUI Inc. Apache-2.0. Modified for StyleX.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const rangeCalendarStyles = stylex.create({
  root: {
    position: "relative",
    width: { default: 338, ":is([data-lenso-slot=date-range-picker-popover] > *)": 346 },
    maxWidth: "100%",
    containerType: "inline-size",
    fontFamily: tokens.fontBody,
  },
  cell: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    marginInline: 0,
    marginBlock: 2,
    padding: 0,
    borderRadius: 0,
    "::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      borderRadius: "inherit",
      pointerEvents: "none",
    },
    outline: "none",
    cursor: "pointer",
  },
  cellButton: {
    position: "relative",
    display: "flex",
    height: 38,
    width: 38,
    maxWidth: "100%",
    marginInline: "auto",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    whiteSpace: "nowrap",
    fontVariantNumeric: "tabular-nums",
    fontSize: 20,
    lineHeight: "24px",
    fontWeight: 400,
    color: tokens.labelPrimary,
  },
  raised: { zIndex: 2 },
  pressed: { scale: ".9" },
  rowEdges: {
    borderStartStartRadius: {
      default: 0,
      ":is(td:first-child > *,[aria-disabled] + td > *,td:has(> [data-outside-month='true']) + td > *)":
        tokens.shapeContentLg,
    },
    borderEndStartRadius: {
      default: 0,
      ":is(td:first-child > *,[aria-disabled] + td > *,td:has(> [data-outside-month='true']) + td > *)":
        tokens.shapeContentLg,
    },
    borderStartEndRadius: {
      default: 0,
      ":is(td:last-child > *,td:has(+ [aria-disabled]) > *,td:has(+ td > [data-outside-month='true']) > *)":
        tokens.shapeContentLg,
    },
    borderEndEndRadius: {
      default: 0,
      ":is(td:last-child > *,td:has(+ [aria-disabled]) > *,td:has(+ td > [data-outside-month='true']) > *)":
        tokens.shapeContentLg,
    },
  },
});
