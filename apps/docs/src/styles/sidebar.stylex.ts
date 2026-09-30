import * as stylex from "@stylexjs/stylex";

export const sidebar = stylex.create({
  item: { display: "flex", alignItems: "center", gap: 8 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    height: 20,
    paddingInline: 6,
    borderRadius: 999,
    fontSize: 10,
    whiteSpace: "nowrap",
  },
  new: {
    backgroundColor: "oklch(71.8% 0.202 349.761 / 8%)",
    color: "oklch(71.8% 0.202 349.761 / 90%)",
    fontWeight: 600,
  },
  updated: {
    backgroundColor: { default: "rgb(0 0 0 / 3%)", ":is(.dark *)": "rgb(255 255 255 / 8%)" },
    color: "color-mix(in oklch, var(--muted) 90%, transparent)",
  },
  preview: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklch, var(--foreground) 10%, transparent)",
    color: "color-mix(in oklch, var(--foreground) 60%, transparent)",
  },
  trigger: {
    width: "100%",
    backgroundColor: "transparent",
    borderWidth: 0,
    font: "inherit",
    textAlign: "start",
    cursor: "pointer",
  },
  chevron: {
    marginInlineStart: "auto",
    transform: { default: "rotate(0deg)", ":is([data-panel-open] *)": "rotate(180deg)" },
  },
  children: { paddingInlineStart: 12 },
});
