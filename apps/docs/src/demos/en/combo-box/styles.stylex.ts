// HeroUI v3.2.6, Apache-2.0. Source example utilities translated to StyleX.
import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  field: { display: "flex", flexDirection: "column", gap: 4, width: 256, maxWidth: "100%" },
  fullWidth: { width: "100%" },
  column: { display: "flex", flexDirection: "column", gap: 8 },
  menu: { display: "flex", flexDirection: "column", gap: 32 },
  wide: { width: 400, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 16 },
  form: { display: "flex", flexDirection: "column", gap: 16, width: 256, maxWidth: "100%" },
  surface: { width: 320, maxWidth: "100%", borderRadius: 24, padding: 24 },
  muted: { margin: 0, fontSize: 14, color: "var(--muted)" },
  caption: { margin: 0, fontSize: 14, fontWeight: 500, color: "var(--muted)" },
  secondary: { backgroundColor: "var(--default)" },
  icon: { width: 12, height: 12 },
  user: { display: "flex", flexDirection: "column" },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingBlock: 8,
  },
  customField: { display: "flex", flexDirection: "column", gap: 6, width: 256, maxWidth: "100%" },
  customLabel: {
    fontWeight: 500,
    color: {
      default: "oklch(0.269 0 0)",
      ":is([data-theme='dark'] *, .dark *)": "oklch(0.97 0 0)",
    },
  },
  customGroup: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    boxShadow: {
      default:
        "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05)",
      ":focus-within":
        "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1), 0 0 0 2px oklch(0.708 0 0 / 0.25)",
      ":is([data-theme='dark'] *, .dark *)":
        "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(255 255 255 / 0.1)",
      ":is([data-theme='dark'] *, .dark *):focus-within":
        "0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1), 0 0 0 2px oklch(0.556 0 0 / 0.3)",
    },
    transitionProperty: "box-shadow, border-color",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  customPopover: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    padding: 4,
    boxShadow: {
      default:
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05)",
      ":is([data-theme='dark'] *, .dark *)":
        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(255 255 255 / 0.1)",
    },
  },
  customItem: {
    borderRadius: 8,
    backgroundColor: {
      default: null,
      ":is([data-highlighted])": "color-mix(in oklch, var(--muted) 70%, transparent)",
    },
    fontWeight: { default: null, ":is([data-selected])": 500 },
    color: { default: null, ":is([data-selected])": "var(--foreground)" },
  },
});
