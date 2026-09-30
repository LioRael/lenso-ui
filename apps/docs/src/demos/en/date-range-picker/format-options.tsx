"use client";
/** Adapted from HeroUI v3.2.6 format-options.json. Copyright NextUI Inc. Apache-2.0. */
import { DateRangePicker, Separator, TimeField } from "@lenso/ui";
import {
  DateFormatter,
  getLocalTimeZone,
  parseDate,
  parseZonedDateTime,
  type DateValue,
} from "@internationalized/date";
import { useLocale } from "react-aria-components/I18nProvider";
import { useMemo, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import {
  FormatControls,
  formatStyles,
  type Granularity,
  type HourCycle,
} from "../date-picker/format-controls";
import { PickerCalendar, RangeInput } from "./parts";

export function FormatOptions() {
  const [granularity, setGranularity] = useState<Granularity>("minute");
  const [hourCycle, setHourCycle] = useState<HourCycle>(12);
  const [hideTimeZone, setHideTimeZone] = useState(false);
  const [shouldForceLeadingZeros, setShouldForceLeadingZeros] = useState(false);
  const { locale } = useLocale();
  const dateFormatter = new DateFormatter(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const defaultValue = useMemo<{ start: DateValue; end: DateValue }>(
    () =>
      granularity === "day"
        ? { start: parseDate("2025-02-03"), end: parseDate("2025-02-10") }
        : {
            start: parseZonedDateTime(`2026-02-03T08:45:00[${getLocalTimeZone()}]`),
            end: parseZonedDateTime(`2026-02-10T18:45:00[${getLocalTimeZone()}]`),
          },
    [granularity],
  );
  const timeGranularity = granularity !== "day" ? granularity : undefined;
  return (
    <div {...stylex.props(formatStyles.rangeStack)}>
      <DateRangePicker
        key={granularity}
        xstyle={formatStyles.rangeField}
        defaultValue={defaultValue}
        startName="startDate"
        endName="endDate"
        granularity={granularity}
        hourCycle={hourCycle}
        hideTimeZone={hideTimeZone}
        shouldForceLeadingZeros={shouldForceLeadingZeros}
      >
        {({ state }) => (
          <>
            <DateRangePicker.Label>Date range</DateRangePicker.Label>
            <RangeInput container />
            <DateRangePicker.Popover xstyle={formatStyles.rangePopover}>
              <PickerCalendar fill />
              {timeGranularity && (
                <div {...stylex.props(formatStyles.times)}>
                  <div {...stylex.props(formatStyles.timeRow)}>
                    <span {...stylex.props(formatStyles.label)}>Start Time</span>
                    <TimeField
                      aria-label="Start Time"
                      granularity={timeGranularity}
                      hourCycle={hourCycle}
                      hideTimeZone={hideTimeZone}
                      name="startTime"
                      shouldForceLeadingZeros={shouldForceLeadingZeros}
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
                    <span {...stylex.props(formatStyles.label)}>End Time</span>
                    <TimeField
                      aria-label="End Time"
                      granularity={timeGranularity}
                      hourCycle={hourCycle}
                      hideTimeZone={hideTimeZone}
                      name="endTime"
                      shouldForceLeadingZeros={shouldForceLeadingZeros}
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
              )}
              <span {...stylex.props(formatStyles.selected)}>
                Selected:{" "}
                {state.value?.start && state.value.end
                  ? dateFormatter.formatRange(
                      state.value.start.toDate(getLocalTimeZone()),
                      state.value.end.toDate(getLocalTimeZone()),
                    )
                  : "No date selected"}
              </span>
            </DateRangePicker.Popover>
          </>
        )}
      </DateRangePicker>
      <Separator xstyle={formatStyles.separator} />
      <span {...stylex.props(formatStyles.heading)}>Format Options</span>
      <FormatControls
        range
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
