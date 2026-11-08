"use client";
// null is Base UI's indeterminate value.
import { ProgressCircle } from "@lenso/ui";
export function Indeterminate() {
  return (
    <ProgressCircle aria-label="Loading" value={null}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}
export default Indeterminate;
