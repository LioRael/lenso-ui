"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Typography } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: { display: "flex", maxWidth: 576, flexDirection: "column", gap: 12 },
});
export function Prose() {
  return (
    <Typography.Prose xstyle={styles.column}>
      <h1>Prose title</h1>
      <p>
        Prose is for authored content where the markup is already semantic and Lenso UI applies the
        default typography rhythm.
      </p>
      <h2>Section title</h2>
      <p>
        Inline code like <code>render</code> receives the same code treatment as the Typography
        primitive.
      </p>
    </Typography.Prose>
  );
}
export default Prose;
