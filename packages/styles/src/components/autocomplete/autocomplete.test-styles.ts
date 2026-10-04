import * as stylex from "@stylexjs/stylex";

export const autocompleteTestStyles = stylex.create({
  trigger: (width: number) => ({ width, borderRadius: 19 }),
  popup: { maxHeight: 160, borderRadius: 19 },
});
