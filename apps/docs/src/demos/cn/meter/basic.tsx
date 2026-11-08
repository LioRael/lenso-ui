"use client";

import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  meter: {
    width: 256,
  },
});
export function Basic() {
  return (
    <Meter aria-label="存储空间" xstyle={styles.meter} value={60}>
      <Meter.Label>存储空间</Meter.Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
