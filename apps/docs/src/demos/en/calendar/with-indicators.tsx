"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { Calendar } from "@lenso/ui";
import { getLocalTimeZone, isToday } from "@internationalized/date";
import { CalendarHeader, CalendarGrid } from "./demo-parts";
const datesWithEvents = [3, 7, 12, 15, 21, 28];
export function WithIndicators() {
  return (
    <Calendar aria-label="Event date">
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
