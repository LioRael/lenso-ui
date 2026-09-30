"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: { display: "flex", width: 256, flexDirection: "column", gap: 24 },
});
export function Sizes() {
  return (
    <div {...stylex.props(styles.column)}>
      <ProgressBar aria-label="Small" size="sm" value={40}>
        <ProgressBar.Label>Small</ProgressBar.Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <ProgressBar aria-label="Medium" size="md" value={60}>
        <ProgressBar.Label>Medium</ProgressBar.Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <ProgressBar aria-label="Large" size="lg" value={80}>
        <ProgressBar.Label>Large</ProgressBar.Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
export default Sizes;
