// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX and native Base UI Button. */
import { Button, Calendar } from "@lenso/ui";
import { getLocalTimeZone, isWeekend, today, type CalendarDate } from "@internationalized/date";
import { useState } from "react";
import { useLocale } from "react-aria-components/I18nProvider";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, layout } from "../../en/calendar/demo-parts";
const bookedDates = [5, 6, 12, 13, 14, 20];
export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<CalendarDate | null>(null);
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar
        aria-label="预订日期"
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
            <span {...stylex.props(layout.mutedDot)} />
            已有预订
          </span>
          <span {...stylex.props(layout.legendItem)}>
            <span {...stylex.props(layout.defaultDot)} />
            周末/不可用
          </span>
        </div>
        {selectedDate ? (
          <Button size="sm" variant="primary">
            预订{selectedDate.toString()}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
