// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select. */
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
