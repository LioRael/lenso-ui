"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Select. */
import { Calendar } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, DurationSelect, layout } from "./demo-parts";
export function WeekView() {
  const [weeks, setWeeks] = useState(1);
  return (
    <div {...stylex.props(layout.controlsStack)}>
      <DurationSelect unit="weeks" value={weeks} onChange={setWeeks} />
      <Calendar aria-label="Week view" visibleDuration={{ weeks }}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
    </div>
  );
}
