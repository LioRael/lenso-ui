// HeroUI v3.2.6 list-box-section.css adaptation, Apache-2.0.
import * as stylex from "@stylexjs/stylex";
export const listBoxSectionStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 0,
    marginBlockStart: { default: 0, ":is([role='listbox'] > :not(:first-child))": 4 },
  },
});
