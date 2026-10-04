// Generated source-backed helper adaptation from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6, e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e. Copyright NextUI Inc. Apache-2.0. Local RAC compounds and StyleX replace source utility classes. */
import { Calendar, DateField, DatePicker } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
export const styles = stylex.create({
  field: {
    width: 288,
  },
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: 288,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: 288,
  },
  full: {
    width: "100%",
  },
  group: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
    backgroundColor: "var(--default)",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  popover: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--border) 80%, transparent)",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  },
  calendar: {
    borderRadius: 16,
    backgroundColor: "var(--surface)",
    padding: 8,
  },
  muted: {
    color: "var(--muted)",
  },
  heading: {
    fontWeight: 500,
    color: "var(--foreground)",
  },
  nav: {
    color: "var(--muted)",
    backgroundColor: {
      default: "transparent",
      ":hover": "var(--default)",
    },
  },
  day: {
    fontSize: 12,
    color: "var(--muted)",
  },
  icon: {
    width: 16,
    height: 16,
  },
  description: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--muted)",
    overflowWrap: "break-word",
  },
  cell: {
    borderRadius: 8,
  },
  selected: {
    backgroundColor: "var(--accent)",
    color: "var(--accent-foreground)",
  },
});
export function PickerInput({
  custom = false,
  indicator,
}: {
  custom?: boolean;
  indicator?: ReactNode;
}) {
  return (
    <DateField.Group
      fullWidth
      variant={custom ? "secondary" : "primary"}
      xstyle={custom && styles.group}
    >
      <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      <DateField.Suffix>
        <DatePicker.Trigger xstyle={custom && styles.muted}>
          <DatePicker.TriggerIndicator>{indicator}</DatePicker.TriggerIndicator>
        </DatePicker.Trigger>
      </DateField.Suffix>
    </DateField.Group>
  );
}
export function PickerCalendar({ custom = false }: { custom?: boolean }) {
  return (
    <Calendar aria-label="活动日期" xstyle={custom && styles.calendar}>
      <Calendar.Header>
        {custom ? (
          <Calendar.Heading xstyle={styles.heading} />
        ) : (
          <Calendar.YearPickerTrigger>
            <Calendar.YearPickerTriggerHeading />
            <Calendar.YearPickerTriggerIndicator />
          </Calendar.YearPickerTrigger>
        )}
        <Calendar.NavButton slot="previous" xstyle={custom && styles.nav} />
        <Calendar.NavButton slot="next" xstyle={custom && styles.nav} />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell xstyle={custom && styles.day}>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>
          {(date) => <Calendar.Cell date={date} xstyle={custom && styles.cell} />}
        </Calendar.GridBody>
      </Calendar.Grid>
      {!custom && (
        <Calendar.YearPickerGrid>
          <Calendar.YearPickerGridBody>
            {({ year }) => <Calendar.YearPickerCell year={year} />}
          </Calendar.YearPickerGridBody>
        </Calendar.YearPickerGrid>
      )}
    </Calendar>
  );
}
