"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, today, type DateValue } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote, layout } from "../calendar/demo-parts";
import { RangeHeader, RangeGrid } from "./demo-parts";
const styles = stylex.create({ error: { fontSize: 14, color: "var(--danger)" } });
export function Invalid() {
  const now = today(getLocalTimeZone());
  const [value, setValue] = useState<{ start: DateValue; end: DateValue }>({
    end: now.add({ days: 14 }),
    start: now.add({ days: 6 }),
  });
  const isInvalid = value.end.compare(value.start) > 7;
  return (
    <div {...stylex.props(layout.stack)}>
      <RangeCalendar
        aria-label="Trip dates"
        firstDayOfWeek="mon"
        isInvalid={isInvalid}
        value={value}
        onChange={setValue}
      >
        <RangeHeader />
        <RangeGrid />
      </RangeCalendar>
      {isInvalid ? (
        <p {...stylex.props(styles.error)}>Maximum stay duration is 1 week</p>
      ) : (
        <CalendarNote>Select a stay of up to 7 days</CalendarNote>
      )}
    </div>
  );
}
