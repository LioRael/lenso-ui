import * as stylex from "@stylexjs/stylex";

export const buttonTestStyles = stylex.create({
  dynamic: (width: number) => ({ width, backgroundColor: "rgb(12, 34, 56)" }),
});
