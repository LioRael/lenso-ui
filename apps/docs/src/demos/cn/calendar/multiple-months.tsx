// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: {
    containerType: "normal",
    width: "100%",
    maxWidth: "none",
    overflowX: "auto",
  },
  months: {
    marginInline: "auto",
    display: "flex",
    width: "max-content",
    gap: 32,
  },
  month: {
    width: 256,
  },
  heading: {
    flex: "none",
  },
  spacer: {
    width: 24,
    height: 24,
  },
});
export function MultipleMonths() {
  return (
    <Calendar
      aria-label="行程日期"
      xstyle={styles.root}
      visibleDuration={{
        months: 2,
      }}
    >
      <div {...stylex.props(styles.months)}>
        <div {...stylex.props(styles.month)}>
          <Calendar.Header>
            <Calendar.NavButton slot="previous" />
            <Calendar.Heading xstyle={styles.heading} />
            <div {...stylex.props(styles.spacer)} />
          </Calendar.Header>
          <Calendar.Grid>
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </div>
        <div {...stylex.props(styles.month)}>
          <Calendar.Header>
            <div {...stylex.props(styles.spacer)} />
            <Calendar.Heading
              xstyle={styles.heading}
              offset={{
                months: 1,
              }}
            />
            <Calendar.NavButton slot="next" />
          </Calendar.Header>
          <Calendar.Grid
            offset={{
              months: 1,
            }}
          >
            <Calendar.GridHeader>
              {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
            </Calendar.GridHeader>
            <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
          </Calendar.Grid>
        </div>
      </div>
    </Calendar>
  );
}
