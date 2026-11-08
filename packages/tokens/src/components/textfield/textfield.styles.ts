// Field geometry follows the supplied Apple Text Fields reference.
import * as stylex from "@stylexjs/stylex";
import { tokens } from "../../tokens.stylex.const.js";
export const textFieldStyles = stylex.create({
  root: { position: "relative", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  fullWidth: { width: "100%" },
  group: {
    containerType: "inline-size",
  },
  groupedField: {
    justifyContent: "center",
  },
  row: {
    display: "grid",
    alignItems: "center",
    columnGap: 12,
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      ":has(> [data-slot='label'])": "minmax(0, 1fr) minmax(0, 2fr)",
      "@container (max-width: 360px)": {
        default: "minmax(0, 1fr)",
        ":has(> [data-slot='label'])": "minmax(0, 1fr)",
      },
    },
    paddingBlock: { default: 0, "@container (max-width: 360px)": 8 },
  },
  stacked: { paddingBlock: 12 },
  rowLabel: {
    fontSize: {
      default: null,
      ":is([data-field-layout='row'] > *, [data-slot='fieldset-row'] > *)": 17,
    },
    lineHeight: {
      default: null,
      ":is([data-field-layout='row'] > *, [data-slot='fieldset-row'] > *)": "22px",
    },
    fontWeight: {
      default: null,
      ":is([data-field-layout='row'] > *, [data-slot='fieldset-row'] > *)": 400,
    },
    overflowWrap: {
      default: null,
      ":is([data-field-layout='row'] > *, [data-slot='fieldset-row'] > *)": "anywhere",
    },
    minWidth: {
      default: null,
      ":is([data-field-layout='row'] > *, [data-slot='fieldset-row'] > *)": 0,
    },
  },
  supporting: {
    gridColumn: { default: null, ":is([data-field-layout='row'] > *)": "1 / -1" },
    paddingBottom: { default: null, ":is([data-field-layout='row'] > *)": 8 },
  },
  control: {
    "--text-field-clear-display": {
      default: "none",
      ":focus-within:not(:has(input:placeholder-shown,input:disabled,input[readonly]))": "flex",
    },
    display: "flex",
    alignItems: "center",
    height: "auto",
    minHeight: 52,
    boxShadow: {
      default: "none",
      ":is([data-invalid], [aria-invalid='true'], :has([data-invalid]))": `inset 0 0 0 1px ${tokens.statusErrorIndicator}`,
    },
    outline: {
      default: "none",
      ":has(input:focus-visible):not(:is([data-lenso-focus-method='pointer'] *))":
        "1.5px solid var(--lenso-focus-ring)",
    },
    outlineOffset: -2,
    opacity: { default: 1, ":has(input:disabled)": 0.4 },
  },
  input: {
    opacity: 1,
  },
  clear: {
    display: "var(--text-field-clear-display)",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    width: 44,
    height: 44,
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    color: tokens.labelPlaceholder,
    cursor: tokens.cursorInteractive,
    borderRadius: "50%",
    outline: { default: "none", ":focus-visible": "1.5px solid var(--lenso-focus-ring)" },
    outlineOffset: -6,
  },
});
