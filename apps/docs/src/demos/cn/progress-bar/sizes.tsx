"use client";

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
