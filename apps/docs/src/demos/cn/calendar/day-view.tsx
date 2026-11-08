"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select.
import { Calendar } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, DurationSelect, layout } from "../../en/calendar/demo-parts";
export function DayView() {
  const [days, setDays] = useState(5);
  return (
    <div {...stylex.props(layout.controlsStack)}>
      <DurationSelect unit="days" value={days} onChange={setDays} />
      <Calendar
        aria-label="日视图"
        visibleDuration={{
          days,
        }}
      >
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
    </div>
  );
}
