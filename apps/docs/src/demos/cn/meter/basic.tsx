// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Meter } from "@lenso/ui";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  return (
    <Meter aria-label="存储空间" xstyle={demoStyles.field} value={60}>
      <Meter.Label>存储空间</Meter.Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
