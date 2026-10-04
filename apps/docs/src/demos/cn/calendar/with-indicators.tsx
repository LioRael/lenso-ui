// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { Calendar } from "@lenso/ui";
import { getLocalTimeZone, isToday } from "@internationalized/date";
import { CalendarHeader, CalendarGrid } from "../../en/calendar/demo-parts";
const datesWithEvents = [3, 7, 12, 15, 21, 28];
export function WithIndicators() {
  return (
    <Calendar aria-label="活动日期">
      <CalendarHeader />
      <CalendarGrid
        cell={(date) => (
          <Calendar.Cell date={date}>
            {({ formattedDate }) => (
              <>
                {formattedDate}
                {(isToday(date, getLocalTimeZone()) || datesWithEvents.includes(date.day)) && (
                  <Calendar.CellIndicator />
                )}
              </>
            )}
          </Calendar.Cell>
        )}
      />
    </Calendar>
  );
}
