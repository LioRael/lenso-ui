// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  column: {
    display: "flex",
    width: 256,
    flexDirection: "column",
    gap: 24,
  },
});
export function Sizes() {
  return (
    <div {...stylex.props(styles.column)}>
      <ProgressBar aria-label="小" size="sm" value={40}>
        <ProgressBar.Label>小</ProgressBar.Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <ProgressBar aria-label="中" size="md" value={60}>
        <ProgressBar.Label>中</ProgressBar.Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <ProgressBar aria-label="大" size="lg" value={80}>
        <ProgressBar.Label>大</ProgressBar.Label>
        <ProgressBar.Output />
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
export default Sizes;
