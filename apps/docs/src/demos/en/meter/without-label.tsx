"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0).
import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({ meter: { width: 256 } });
export function WithoutLabel() {
  return (
    <Meter aria-label="Storage usage" xstyle={styles.meter} value={45}>
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
export default WithoutLabel;
