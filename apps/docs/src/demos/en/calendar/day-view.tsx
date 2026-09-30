"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select. */
import { Calendar } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, DurationSelect, layout } from "./demo-parts";
export function DayView() {
  const [days, setDays] = useState(5);
  return (
    <div {...stylex.props(layout.controlsStack)}>
      <DurationSelect unit="days" value={days} onChange={setDays} />
      <Calendar aria-label="Day view" visibleDuration={{ days }}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
    </div>
  );
}
