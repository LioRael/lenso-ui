// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6 format-options.json. Copyright NextUI Inc. Apache-2.0. */
import { DatePicker, TimeField } from "@lenso/ui";
import {
  getLocalTimeZone,
  parseDate,
  parseZonedDateTime,
  type DateValue,
} from "@internationalized/date";
import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { PickerCalendar, PickerInput } from "./format-options--parts";
import {
  FormatControls,
  formatStyles,
  type Granularity,
  type HourCycle,
} from "./format-options--format-controls";
export function FormatOptions() {
  const [granularity, setGranularity] = useState<Granularity>("minute");
  const [hourCycle, setHourCycle] = useState<HourCycle>(12);
  const [hideTimeZone, setHideTimeZone] = useState(false);
  const [shouldForceLeadingZeros, setShouldForceLeadingZeros] = useState(false);
  const timeGranularity = granularity !== "day" ? granularity : undefined;
  const defaultValue = useMemo<DateValue>(
    () =>
      granularity === "day"
        ? parseDate("2026-02-03")
        : parseZonedDateTime(`2026-02-03T08:45:00[${getLocalTimeZone()}]`),
    [granularity],
  );
  return (
    <div {...stylex.props(formatStyles.stack)}>
      <DatePicker
        key={granularity}
        xstyle={formatStyles.field}
        defaultValue={defaultValue}
        granularity={granularity}
        hourCycle={hourCycle}
        hideTimeZone={hideTimeZone}
        shouldForceLeadingZeros={shouldForceLeadingZeros}
        name="date"
      >
        {({ state }) => (
          <>
            <DatePicker.Label>日期和时间</DatePicker.Label>
            <PickerInput />
            <DatePicker.Popover xstyle={formatStyles.popover}>
              <PickerCalendar />
              {timeGranularity && (
                <div {...stylex.props(formatStyles.timeRow)}>
                  <span {...stylex.props(formatStyles.label)}>时间</span>
                  <TimeField
                    aria-label="时间"
                    granularity={timeGranularity}
                    hourCycle={hourCycle}
                    hideTimeZone={hideTimeZone}
                    name="time"
                    shouldForceLeadingZeros={shouldForceLeadingZeros}
                    value={state.timeValue}
                    onChange={(value) => {
                      if (value) state.setTimeValue(value);
                    }}
                  >
                    <TimeField.Group variant="secondary">
                      <TimeField.Input>
                        {(segment) => <TimeField.Segment segment={segment} />}
                      </TimeField.Input>
                    </TimeField.Group>
                  </TimeField>
                </div>
              )}
            </DatePicker.Popover>
          </>
        )}
      </DatePicker>
      <FormatControls
        {...{
          granularity,
          setGranularity,
          hourCycle,
          setHourCycle,
          hideTimeZone,
          setHideTimeZone,
          shouldForceLeadingZeros,
          setShouldForceLeadingZeros,
        }}
      />
    </div>
  );
}
