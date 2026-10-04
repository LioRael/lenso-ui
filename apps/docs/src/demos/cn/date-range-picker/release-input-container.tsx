// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** Adapted from HeroUI v3.2.6 release-input-container.json. Copyright NextUI Inc. Apache-2.0. */
import { DateRangePicker, TimeField } from "@lenso/ui";
import { getLocalTimeZone, parseZonedDateTime } from "@internationalized/date";
import * as stylex from "@stylexjs/stylex";
import { formatStyles } from "../../en/date-picker/format-controls";
import { PickerCalendar, RangeInput } from "./release-input-container--parts";
export function InputContainer() {
  const localTimeZone = getLocalTimeZone();
  const defaultValue = {
    start: parseZonedDateTime(`2026-02-03T08:45:00[${localTimeZone}]`),
    end: parseZonedDateTime(`2026-02-10T18:45:00[${localTimeZone}]`),
  };
  return (
    <DateRangePicker
      shouldForceLeadingZeros
      xstyle={formatStyles.releaseField}
      defaultValue={defaultValue}
      granularity="second"
      hourCycle={12}
    >
      {({ state }) => (
        <>
          <DateRangePicker.Label>日期范围</DateRangePicker.Label>
          <RangeInput container />
          <DateRangePicker.Popover xstyle={formatStyles.releasePopover}>
            <PickerCalendar />
            <div {...stylex.props(formatStyles.times)}>
              <div {...stylex.props(formatStyles.timeRow)}>
                <span {...stylex.props(formatStyles.label)}>开始时间</span>
                <TimeField
                  shouldForceLeadingZeros
                  aria-label="开始时间"
                  granularity="second"
                  hourCycle={12}
                  value={state.timeRange?.start ?? null}
                  onChange={(value) => state.setTime("start", value)}
                >
                  <TimeField.Group variant="secondary">
                    <TimeField.Input>
                      {(segment) => <TimeField.Segment segment={segment} />}
                    </TimeField.Input>
                  </TimeField.Group>
                </TimeField>
              </div>
              <div {...stylex.props(formatStyles.timeRow)}>
                <span {...stylex.props(formatStyles.label)}>结束时间</span>
                <TimeField
                  shouldForceLeadingZeros
                  aria-label="结束时间"
                  granularity="second"
                  hourCycle={12}
                  value={state.timeRange?.end ?? null}
                  onChange={(value) => state.setTime("end", value)}
                >
                  <TimeField.Group variant="secondary">
                    <TimeField.Input>
                      {(segment) => <TimeField.Segment segment={segment} />}
                    </TimeField.Input>
                  </TimeField.Group>
                </TimeField>
              </div>
            </div>
          </DateRangePicker.Popover>
        </>
      )}
    </DateRangePicker>
  );
}
