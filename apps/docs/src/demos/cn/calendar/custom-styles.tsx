// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    width: 252,
    borderRadius: "var(--radius-2xl)",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab,var(--border) 80%,transparent)",
      ':is([data-theme="dark"] *)': "color-mix(in oklab,var(--border) 90%,transparent)",
    },
    backgroundColor: "var(--surface)",
    padding: 12,
    boxShadow: {
      default:
        "0 1px 2px 0 rgb(0 0 0 / .05), 0 0 0 1px color-mix(in oklab,var(--accent) 5%,transparent)",
      ':is([data-theme="dark"] *)':
        "0 1px 2px 0 rgb(0 0 0 / .05), 0 0 0 1px color-mix(in oklab,var(--accent) 10%,transparent)",
    },
  },
  heading: {
    color: "var(--foreground)",
  },
  cell: {
    backgroundColor: {
      default: null,
      ":hover": "var(--default)",
      ":is([data-hovered])": "var(--default)",
      ":is([data-selected])": "var(--accent)",
      ":is([data-selected]):is(:hover,[data-hovered])": "var(--accent-hover)",
      ":is([data-selected][data-outside-month])": "var(--default)",
      ":is([data-today])": "var(--accent-soft)",
      ":is([data-today]):is(:hover,[data-hovered])": "var(--accent-soft-hover)",
      ":is([data-selected][data-today])": "var(--accent)",
      ":is([data-selected][data-today]):hover": "var(--accent-hover)",
    },
    color: {
      default: null,
      ":is([data-outside-month])": "var(--muted)",
      ":is([data-selected])": "var(--accent-foreground)",
      ":is([data-today])": "var(--accent-soft-foreground)",
      ":is([data-selected][data-today])": "var(--accent-foreground)",
    },
  },
});
export function CustomStyles() {
  return (
    <Calendar aria-label="自定义样式日历" xstyle={styles.root}>
      <Calendar.Header>
        <Calendar.Heading xstyle={styles.heading} />
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>
          {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
        </Calendar.GridHeader>
        <Calendar.GridBody>
          {(date) => <Calendar.Cell xstyle={styles.cell} date={date} />}
        </Calendar.GridBody>
      </Calendar.Grid>
    </Calendar>
  );
}
