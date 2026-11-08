"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select.
import { Calendar } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, DurationSelect, layout } from "../../en/calendar/demo-parts";
export function WeekView() {
  const [weeks, setWeeks] = useState(1);
  return (
    <div {...stylex.props(layout.controlsStack)}>
      <DurationSelect unit="weeks" value={weeks} onChange={setWeeks} />
      <Calendar
        aria-label="周视图"
        visibleDuration={{
          weeks,
        }}
      >
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
    </div>
  );
}
