import * as stylex from "@stylexjs/stylex";

// Desktop content frame from Sheet - iPad. Other presentation roles retain
// their referenced materials; see docs/design/presentation-materials.md.
export const presentation = stylex.defineConsts({
  background: "light-dark(var(--lenso-background-primary), var(--lenso-background-secondary))",
  radius: "32px",
  shadow: "0 15px 75px rgb(0 0 0 / .18)",
});
