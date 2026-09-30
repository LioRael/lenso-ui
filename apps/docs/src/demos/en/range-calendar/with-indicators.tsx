"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. */
import { RangeCalendar } from "@lenso/ui";
import { getLocalTimeZone, isToday } from "@internationalized/date";
import { RangeHeader, RangeGrid } from "./demo-parts";
const datesWithEvents = [3, 7, 12, 15, 21, 28];
export function WithIndicators() {
  return (
    <RangeCalendar aria-label="Trip dates">
      <RangeHeader />
      <RangeGrid
        cell={(date) => (
          <RangeCalendar.Cell date={date}>
            {({ formattedDate }) => (
              <>
                {formattedDate}
                {(isToday(date, getLocalTimeZone()) || datesWithEvents.includes(date.day)) && (
                  <RangeCalendar.CellIndicator />
                )}
              </>
            )}
          </RangeCalendar.Cell>
        )}
      />
    </RangeCalendar>
  );
}
