"use client";

// Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select.
import { RangeCalendar } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { DurationSelect, layout } from "../../en/calendar/demo-parts";
import { RangeHeader, RangeGrid } from "../../en/range-calendar/demo-parts";
export function DayView() {
  const [days, setDays] = useState(5);
  return (
    <div {...stylex.props(layout.controlsStack)}>
      <DurationSelect unit="days" value={days} onChange={setDays} />
      <RangeCalendar
        key={days}
        aria-label="行程日期"
        visibleDuration={{
          days,
        }}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
    </div>
  );
}
