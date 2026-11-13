// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: compound native UI SDK field parts and explicit clear semantics.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const searchFieldGroupStyles = stylex.create({
  root: {
    position: "relative",
    isolation: "isolate",
    opacity: { default: 1, ":is([data-disabled])": 0.38 },
    display: "flex",
    alignItems: "center",
    boxSizing: "border-box",
    width: "100%",
    height: 44,
    gap: 4,
    paddingInlineStart: 11,
    paddingInlineEnd: 10,
    border: 0,
    borderRadius: 296,
    backgroundColor: "transparent",
    color: "var(--lenso-label-primary)",
    outline: {
      default: "none",
      ":has(input:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
      ":is([data-field-grouped] *, [data-lenso-slot='fieldset-row'] *):has(:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "none",
    },
    outlineOffset: 2,
    boxShadow: {
      default:
        "var(--lenso-fusion-shadow, var(--lenso-glass-shadow, var(--lenso-material-action-shadow)))",
      ":is([data-invalid], :has([data-invalid]), [data-invalid] *)": `inset 0 0 0 1px ${tokens.statusErrorIndicator}, var(--lenso-fusion-shadow, var(--lenso-glass-shadow, var(--lenso-material-action-shadow)))`,
    },
  },
  input: {
    position: "relative",
    flex: "1 1 auto",
    minWidth: 0,
    width: "100%",
    height: "100%",
    padding: 0,
    border: 0,
    outline: "none",
    backgroundColor: "transparent",
    color: "inherit",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: 500,
    fontSize: 17,
    lineHeight: "20px",
    "::placeholder": { color: "var(--lenso-label-placeholder)" },
    "::-webkit-search-cancel-button": { display: "none" },
  },
  secondary: { position: "relative" },
  fullWidth: { width: "100%", maxWidth: "none" },
});
export const searchFieldStyles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 4, width: "100%", maxWidth: 360 },
  icon: { width: 26, height: 20, flexShrink: 0, color: "var(--lenso-label-secondary)" },
  clear: {
    display: { default: "grid", ":disabled": "none" },
    flexShrink: 0,
    placeItems: "center",
    width: 32,
    height: 32,
    marginRight: -6,
    padding: 0,
    borderWidth: 0,
    borderRadius: "50%",
    color: "var(--lenso-label-secondary)",
    backgroundColor: "transparent",
    cursor: "pointer",
    outline: { default: "none", ":focus-visible": "1.5px solid var(--lenso-focus-ring)" },
    outlineOffset: 2,
    visibility: { default: "visible", ":disabled": "hidden" },
    pointerEvents: { default: "auto", ":disabled": "none" },
  },
  clearIcon: { width: 14, height: 14 },
});
