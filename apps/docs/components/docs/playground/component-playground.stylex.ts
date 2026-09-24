import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  copyButton: { width: "82px", "@media (max-width: 900px)": { height: "44px" } },
  resetButton: { height: "32px", "@media (max-width: 900px)": { height: "44px" } },
});
