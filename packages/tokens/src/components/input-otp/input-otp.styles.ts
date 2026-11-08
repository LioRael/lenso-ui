// Modified by Lenso contributors: native code fields with ordinary and glass materials.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const inputOTPStyles = stylex.create({
  root: {
    position: "relative",
    display: "flex",
    width: "fit-content",
    maxWidth: "100%",
    minWidth: 0,
    alignItems: "center",
    gap: { default: 12, "@media (max-width: 480px)": 8 },
  },
  group: {
    display: "flex",
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: { default: 8, "@media (max-width: 480px)": 4 },
  },
  slot: {
    appearance: "none",
    boxSizing: "border-box",
    width: 44,
    height: "auto",
    aspectRatio: "1 / 1",
    minWidth: 0,
    minHeight: 0,
    flex: 1,
    margin: 0,
    padding: 0,
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: tokens.backgroundGroupedSecondary,
    color: tokens.labelPrimary,
    caretColor: tokens.tint,
    boxShadow: {
      default: "none",
      ":is([data-invalid], [aria-invalid='true'])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}`,
    },
    outline: {
      default: "none",
      ":focus-visible:not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
    },
    outlineOffset: 2,
    textAlign: "center",
    fontFamily: "inherit",
    fontSize: 22,
    lineHeight: "28px",
    fontWeight: 500,
    fontVariantNumeric: "tabular-nums",
    opacity: { default: 1, ":is(:disabled, [data-disabled])": 0.4 },
    "::placeholder": { color: tokens.labelPlaceholder, opacity: 1 },
  },
  glass: {
    position: "relative",
    backgroundColor: {
      default: "var(--lenso-material-action-fill)",
      ":is([data-material-filter])": "transparent",
    },
    boxShadow: {
      default: "var(--lenso-material-action-shadow)",
      ":is([data-invalid], [aria-invalid='true'])": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, var(--lenso-material-action-shadow)`,
    },
  },
  separator: {
    height: 2,
    width: 8,
    flexShrink: 0,
    borderRadius: tokens.shapeContentSm,
    backgroundColor: tokens.separator,
  },
  secondary: { backgroundColor: tokens.fillTertiary },
});
