// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (Apache-2.0); null is Base UI's indeterminate value.
import { ProgressCircle } from "@lenso/ui";
export function Indeterminate() {
  return (
    <ProgressCircle aria-label="加载中" value={null}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}
export default Indeterminate;
