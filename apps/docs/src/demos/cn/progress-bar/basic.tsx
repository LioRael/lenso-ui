// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { ProgressBar } from "@lenso/ui";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  return (
    <ProgressBar aria-label="加载中" xstyle={demoStyles.field} value={60}>
      <ProgressBar.Label>加载中</ProgressBar.Label>
      <ProgressBar.Output />
      <ProgressBar.Track>
        <ProgressBar.Fill />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
