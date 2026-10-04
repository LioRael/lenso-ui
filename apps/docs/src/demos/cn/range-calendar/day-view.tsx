// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select. */
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
