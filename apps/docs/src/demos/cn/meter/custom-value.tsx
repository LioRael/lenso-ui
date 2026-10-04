// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0); native Base UI range and formatting.
import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  meter: {
    width: 256,
  },
});
export function CustomValue() {
  return (
    <Meter
      xstyle={styles.meter}
      format={{
        currency: "USD",
        style: "currency",
      }}
      max={1000}
      min={0}
      value={750}
    >
      <Meter.Label>收入</Meter.Label>
      <Meter.Output />
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
export default CustomValue;
