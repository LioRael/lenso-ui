"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { RangeCalendar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  root: { containerType: "normal", width: "100%", maxWidth: "none", overflowX: "auto" },
  months: { marginInline: "auto", display: "flex", width: "max-content", gap: 32 },
  month: { width: 256 },
  heading: { flex: "none" },
  spacer: { width: 24, height: 24 },
});
export function MultipleMonths() {
  return (
    <RangeCalendar aria-label="Trip dates" xstyle={styles.root} visibleDuration={{ months: 2 }}>
      <div {...stylex.props(styles.months)}>
        <div {...stylex.props(styles.month)}>
          <RangeCalendar.Header>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.Heading xstyle={styles.heading} />
            <div {...stylex.props(styles.spacer)} />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </div>
        <div {...stylex.props(styles.month)}>
          <RangeCalendar.Header>
            <div {...stylex.props(styles.spacer)} />
            <RangeCalendar.Heading xstyle={styles.heading} offset={{ months: 1 }} />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid offset={{ months: 1 }}>
            <RangeCalendar.GridHeader>
              {(day) => <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </div>
      </div>
    </RangeCalendar>
  );
}
