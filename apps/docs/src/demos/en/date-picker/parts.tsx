"use client";
// Copyright NextUI Inc. Apache-2.0. Local RAC compounds and StyleX replace source utility classes.
import { Calendar, DateField, DatePicker } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

export const styles = stylex.create({
  field: { width: 288 },
  stack: { display: "flex", flexDirection: "column", gap: 16, width: 288 },
  actions: { display: "flex", gap: 8 },
  form: { display: "flex", flexDirection: "column", gap: 12, width: 288 },
  full: { width: "100%" },
  group: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--lenso-control-border) 80%, transparent)",
    backgroundColor: "var(--lenso-control-fill)",
    boxShadow: "var(--lenso-surface-shadow)",
  },
  popover: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab, var(--lenso-control-border) 80%, transparent)",
    boxShadow: "var(--lenso-surface-shadow)",
  },
  calendar: {
    borderRadius: 16,
    backgroundColor: "var(--lenso-background-grouped-secondary)",
    padding: 8,
  },
  muted: { color: "var(--lenso-label-secondary)" },
  heading: { fontWeight: 500, color: "var(--lenso-label-primary)" },
  nav: {
    color: "var(--lenso-label-secondary)",
    backgroundColor: { default: "transparent", ":hover": "var(--lenso-control-fill)" },
  },
  day: { fontSize: 12, color: "var(--lenso-label-secondary)" },
  icon: { width: 16, height: 16 },
  description: {
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--lenso-label-secondary)",
    overflowWrap: "break-word",
  },
  cell: { borderRadius: 8 },
  selected: { backgroundColor: "var(--lenso-tint)", color: "var(--lenso-label-on-tint)" },
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
    <Calendar aria-label="Event date" xstyle={custom && styles.calendar}>
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
