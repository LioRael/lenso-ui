"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
export function Disabled() {
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar isDisabled aria-label="Trip dates">
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      <CalendarNote>Range calendar is disabled</CalendarNote>
    </div>
  );
}
