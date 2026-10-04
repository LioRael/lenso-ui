import * as stylex from "@stylexjs/stylex";

export const comboBoxTestStyles = stylex.create({
  customShell: {
    width: 256,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: "var(--surface)",
    boxShadow: "0 1px 2px rgb(0 0 0 / 10%)",
  },
  dynamicShell: (width: number) => ({
    width,
    borderRadius: 19,
    backgroundColor: "rgb(12, 34, 56)",
  }),
  dynamicInput: (padding: number) => ({
    paddingInlineStart: padding,
  }),
});
