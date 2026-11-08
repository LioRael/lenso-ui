"use client";

// null is Base UI's indeterminate value.
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
