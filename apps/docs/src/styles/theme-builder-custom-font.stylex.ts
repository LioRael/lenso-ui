// Adapted from HeroUI v3.2.6 custom-fonts.tsx (e385ac2), Apache-2.0.
// Modified by Lenso contributors: utility layout translated to StyleX;
// source link presentation retained on a native Base UI back button.
import * as stylex from "@stylexjs/stylex";

export const themeBuilderCustomFont = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: 8 },
  backRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  back: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: "fit-content",
    width: "fit-content",
    minWidth: 0,
    padding: 0,
    transform: "none",
    borderRadius: "var(--radius-xl)",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    fontWeight: 500,
    color: "var(--link)",
    backgroundColor: "transparent",
    textDecorationLine: "none",
  },
  globe: { color: "var(--muted)" },
});
