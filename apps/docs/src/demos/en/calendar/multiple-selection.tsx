"use client";
/** HeroUI v3.2.6 derived work. Copyright NextUI Inc. Apache-2.0. Modified for StyleX. */
import { Calendar } from "@lenso/ui";
import type { DateValue } from "@internationalized/date";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { CalendarNote } from "./demo-parts";

const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
  description: { textAlign: "center" },
});

export function MultipleSelection() {
  const [value, setValue] = useState<readonly DateValue[]>([]);
  return (
    <div {...stylex.props(styles.root)}>
      <Calendar aria-label="Event dates" selectionMode="multiple" value={value} onChange={setValue}>
        <Calendar.Header>
          <Calendar.Heading />
          <Calendar.NavButton slot="previous" />
          <Calendar.NavButton slot="next" />
        </Calendar.Header>
        <Calendar.Grid>
          <Calendar.GridHeader>
            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
          </Calendar.GridHeader>
          <Calendar.GridBody>{(date) => <Calendar.Cell date={date} />}</Calendar.GridBody>
        </Calendar.Grid>
      </Calendar>
      <CalendarNote>
        {value.length ? `${value.length} date(s) selected` : "Select multiple dates"}
      </CalendarNote>
    </div>
  );
}
