"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Skeleton } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  text: { width: "100%", maxWidth: 448, display: "flex", flexDirection: "column", gap: 12 },
  line: { height: 16, borderRadius: "var(--radius)" },
  full: { width: "100%" },
  five: { width: "83.333333%" },
  four: { width: "66.666667%" },
  half: { width: "50%" },
});
export function TextContent() {
  return (
    <div {...stylex.props(styles.text)}>
      <Skeleton xstyle={[styles.line, styles.full]} />
      <Skeleton xstyle={[styles.line, styles.five]} />
      <Skeleton xstyle={[styles.line, styles.four]} />
      <Skeleton xstyle={[styles.line, styles.full]} />
      <Skeleton xstyle={[styles.line, styles.half]} />
    </div>
  );
}
export default TextContent;
