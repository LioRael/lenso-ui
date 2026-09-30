"use client";

import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ meter: { width: 256 } });

export function Basic() {
  return (
    <Meter aria-label="Storage" xstyle={styles.meter} value={60}>
      <Meter.Label>Storage</Meter.Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
