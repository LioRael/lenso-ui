"use client";

import { ProgressBar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  progress: {
    width: 256,
  },
});
export function Basic() {
  return (
    <ProgressBar aria-label="加载中" xstyle={styles.progress} value={60}>
      <ProgressBar.Label>加载中</ProgressBar.Label>
      <ProgressBar.Output />
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
