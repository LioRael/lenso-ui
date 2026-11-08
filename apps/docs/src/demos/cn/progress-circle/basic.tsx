"use client";

import { ProgressCircle } from "@lenso/ui";
export function Basic() {
  return (
    <ProgressCircle aria-label="加载中" value={60}>
      <ProgressCircle.Track>
        <ProgressCircle.TrackCircle />
        <ProgressCircle.FillCircle />
      </ProgressCircle.Track>
    </ProgressCircle>
  );
}
