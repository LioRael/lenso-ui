// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import { parseDate } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: 252,
    borderRadius: "var(--radius-xl)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "color-mix(in oklab,var(--border) 80%,transparent)",
    backgroundColor: "var(--surface)",
    padding: 12,
    boxShadow:
      "0 1px 2px 0 rgb(0 0 0 / .05),0 0 0 1px color-mix(in oklab,var(--success) 10%,transparent)",
  },
  heading: {
    color: "var(--foreground)",
  },
  nav: {
    borderRadius: "var(--radius-md)",
    color: "var(--success)",
    backgroundColor: {
      default: "transparent",
      ":hover": "var(--success-soft)",
      ":is([data-hovered])": "var(--success-soft)",
    },
  },
  cell: {
    borderRadius: {
      default: "var(--radius-md)",
      ":is([data-selected])": 0,
    },
    borderTopLeftRadius: {
      default: "var(--radius-md)",
      ":is([data-selected])": 0,
      ":is([data-selection-start])": "var(--radius-md)",
    },
    borderBottomLeftRadius: {
      default: "var(--radius-md)",
      ":is([data-selected])": 0,
      ":is([data-selection-start])": "var(--radius-md)",
    },
    borderTopRightRadius: {
      default: "var(--radius-md)",
      ":is([data-selected])": 0,
      ":is([data-selection-end])": "var(--radius-md)",
    },
    borderBottomRightRadius: {
      default: "var(--radius-md)",
      ":is([data-selected])": 0,
      ":is([data-selection-end])": "var(--radius-md)",
    },
    backgroundColor: {
      default: null,
      ":is([data-selected])": "var(--success-soft)",
      ":is([data-selected][data-outside-month])":
        "color-mix(in oklab,var(--default) 20%,transparent)",
    },
  },
  button: {
    borderRadius: "var(--radius-md)",
    backgroundColor: {
      default: null,
      ":is([data-hovered]:not([data-selected]) > *)": "var(--default)",
      ":is([data-today] > *)": "var(--success-soft)",
      ":is([data-today][data-hovered]:not([data-selected]) > *)": "var(--success-soft-hover)",
      ":is([data-selection-start] > *,[data-selection-end] > *)": "var(--success)",
      ":is([data-selection-start][data-pressed] > *,[data-selection-end][data-pressed] > *)":
        "var(--success-hover)",
    },
    color: {
      default: null,
      ":is([data-today] > *)": "var(--success-soft-foreground)",
      ":is([data-selection-start] > *,[data-selection-end] > *)": "var(--success-foreground)",
    },
  },
});
export function CustomStyles() {
  return (
    <RangeCalendar
      aria-label="酒店入住"
      xstyle={styles.root}
      defaultValue={{
        end: parseDate("2025-02-14"),
        start: parseDate("2025-02-08"),
      }}
      firstDayOfWeek="mon"
    >
      <RangeCalendar.Header>
        <RangeCalendar.Heading xstyle={styles.heading} />
        <RangeCalendar.NavButton xstyle={styles.nav} slot="previous" />
        <RangeCalendar.NavButton xstyle={styles.nav} slot="next" />
      </RangeCalendar.Header>
      <RangeCalendar.Grid>
        <RangeCalendar.GridHeader>
          {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
        </RangeCalendar.GridHeader>
        <RangeCalendar.GridBody>
          {(date) => (
            <RangeCalendar.Cell date={date} xstyle={styles.cell} buttonXstyle={styles.button} />
          )}
        </RangeCalendar.GridBody>
      </RangeCalendar.Grid>
    </RangeCalendar>
  );
}
