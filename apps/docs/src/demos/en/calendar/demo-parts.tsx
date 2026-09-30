"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar, Select } from "@lenso/ui";
import type { CalendarDate } from "@internationalized/date";
import type { ReactElement, ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

export const layout = stylex.create({
  stack: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  controlsStack: { display: "flex", flexDirection: "column", alignItems: "center", gap: 24 },
  controls: { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  bookingDetails: { display: "flex", flexDirection: "column", gap: 8, textAlign: "center" },
  description: {
    textAlign: "center",
    fontSize: 12,
    lineHeight: "16px",
    color: "var(--muted)",
    overflowWrap: "break-word",
  },
  select: { width: 160 },
  selectField: { display: "flex", flexDirection: "column", gap: 6, width: 160 },
  legend: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    fontSize: 12,
    color: "var(--muted)",
  },
  legendItem: { display: "flex", alignItems: "center", gap: 4 },
  mutedDot: { width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--muted)" },
  defaultDot: { width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--default)" },
});

export function CalendarHeader() {
  return (
    <Calendar.Header>
      <Calendar.Heading />
      <Calendar.NavButton slot="previous" />
      <Calendar.NavButton slot="next" />
    </Calendar.Header>
  );
}

export function CalendarGrid({ cell }: { cell?: (date: CalendarDate) => ReactElement }) {
  return (
    <Calendar.Grid>
      <Calendar.GridHeader>
        {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
      </Calendar.GridHeader>
      <Calendar.GridBody>{cell ?? ((date) => <Calendar.Cell date={date} />)}</Calendar.GridBody>
    </Calendar.Grid>
  );
}

export function CalendarNote({ children }: { children: ReactNode }) {
  return <p {...stylex.props(layout.description)}>{children}</p>;
}

export function DurationSelect({
  unit,
  value,
  onChange,
}: {
  unit: "days" | "weeks";
  value: number;
  onChange: (value: number) => void;
}) {
  const options = unit === "days" ? [1, 5, 7, 8, 10, 14, 21] : [1, 2, 3, 4, 5, 6, 8];
  const singular = unit === "days" ? "day" : "week";
  return (
    <div {...stylex.props(layout.selectField)}>
      <Select
        value={String(value)}
        onValueChange={(next) => {
          if (next) onChange(Number(next));
        }}
      >
        <Select.Label>Visible {unit}</Select.Label>
        <Select.Trigger xstyle={layout.select}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popover>
              <Select.List>
                {options.map((option) => (
                  <Select.Item key={option} value={String(option)}>
                    <Select.ItemText>
                      {option} {option === 1 ? singular : unit}
                    </Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popover>
          </Select.Positioner>
        </Select.Portal>
      </Select>
    </div>
  );
}
