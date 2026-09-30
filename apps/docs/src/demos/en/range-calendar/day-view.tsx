"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select. */
import { RangeCalendar } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { DurationSelect, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function DayView() {
  const [days, setDays] = useState(5);
  return (
    <div {...stylex.props(layout.controlsStack)}>
      <DurationSelect unit="days" value={days} onChange={setDays} />
      <RangeCalendar key={days} aria-label="Trip dates" visibleDuration={{ days }}>
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
    </div>
  );
}
