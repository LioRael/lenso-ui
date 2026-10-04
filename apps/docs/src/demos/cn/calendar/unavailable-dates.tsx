// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar } from "@lenso/ui";
import { isWeekend } from "@internationalized/date";
import { useLocale } from "react-aria-components/I18nProvider";
import * as stylex from "@stylexjs/stylex";
import { CalendarHeader, CalendarGrid, CalendarNote, layout } from "../../en/calendar/demo-parts";
export function UnavailableDates() {
  const { locale } = useLocale();
  return (
    <div {...stylex.props(layout.stack)}>
      <Calendar aria-label="预约日期" isDateUnavailable={(date) => isWeekend(date, locale)}>
        <CalendarHeader />
        <CalendarGrid />
      </Calendar>
      <CalendarNote>周末不可选</CalendarNote>
    </div>
  );
}
