"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar } from "@lenso/ui";
import { isWeekend } from "@internationalized/date";
import { useLocale } from "react-aria-components/I18nProvider";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "./demo-parts";
export function UnavailableDates() {
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="Appointment date" isDateUnavailable={(date) => isWeekend(date, locale)}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>Weekends are unavailable</CalendarNote>
    </div>
  );
}
