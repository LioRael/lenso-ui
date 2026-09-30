"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button. */
import { Button, Calendar } from "@lenso/ui";
import { getLocalTimeZone, isWeekend, today, type CalendarDate } from "@internationalized/date";
import { useState } from "react";
import { useLocale } from "react-aria-components/I18nProvider";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, layout } from "./demo-parts";
const bookedDates = [5, 6, 12, 13, 14, 20];
export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar
        aria-label="Booking date"
        isDateUnavailable={(date) => isWeekend(date, locale) || bookedDates.includes(date.day)}
        minValue={today(getLocalTimeZone())}
        value={selectedDate}
        onChange={setSelectedDate}
      >
        <CalendarHeader />
        <CalendarGrid
          cell={(date) => (
            <Calendar.Cell date={date}>
              {({ formattedDate, isUnavailable }) => (
                <>
                  {formattedDate}
                  {!isUnavailable && !isWeekend(date, locale) && bookedDates.includes(date.day) && (
                    <Calendar.CellIndicator />
                  )}
                </>
              )}
            </Calendar.Cell>
          )}
        />
      </Calendar>
      <div {...stylex.props(layout.bookingDetails)}>
        <div {...stylex.props(layout.legend)}>
          <span {...stylex.props(layout.legendItem)}>
            <span {...stylex.props(layout.mutedDot)} /> Has bookings
          </span>
          <span {...stylex.props(layout.legendItem)}>
            <span {...stylex.props(layout.defaultDot)} /> Weekend/Unavailable
          </span>
        </div>
        {selectedDate ? (
          <Button size="sm" variant="primary">
            Book {selectedDate.toString()}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
