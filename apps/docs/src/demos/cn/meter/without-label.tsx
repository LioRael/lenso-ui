"use client";

import { Meter } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  meter: {
    width: 256,
  },
});
export function WithoutLabel() {
  return (
    <Meter aria-label="存储空间用量" xstyle={styles.meter} value={45}>
      <Meter.Track>
        <Meter.Fill />
      </Meter.Track>
    </Meter>
  );
}
export default WithoutLabel;
