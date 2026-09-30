"use client";
// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { DateValue } from "@internationalized/date";
import { CircleQuestion } from "@gravity-ui/icons";
import { DateField, Select, Tooltip } from "@lenso/ui";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import { useState, useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./demo-styles";

export function Granularity() {
  const granularityOptions = [
    { id: "day", label: "Day" },
    { id: "hour", label: "Hour" },
    { id: "minute", label: "Minute" },
    { id: "second", label: "Second" },
  ] as const;
  const [granularity, setGranularity] = useState<"day" | "hour" | "minute" | "second">("day");
  const labelId = useId();
  const defaultValue: DateValue =
    granularity === "day"
      ? parseDate("2025-02-03")
      : parseZonedDateTime("2025-02-03T08:45:00[America/Los_Angeles]");
  return (
    <div {...stylex.props(styles.granularity)}>
      <DateField
        key={granularity}
        xstyle={styles.field}
        defaultValue={defaultValue}
        granularity={granularity}
        name="granularity-date"
      >
        <DateField.Label>Appointment Date</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <div {...stylex.props(styles.selector)}>
        <div {...stylex.props(styles.selectorLabel)}>
          <span id={labelId}>Granularity</span>
          <Tooltip>
            <Tooltip.Trigger delay={0} aria-label="Granularity information">
              <CircleQuestion {...stylex.props(styles.icon)} aria-hidden="true" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="bottom" align="start">
                <Tooltip.Popup>
                  <p>
                    Determines the smallest unit displayed in the date picker. By default, this is
                    "day" for dates, and "minute" for times.
                  </p>
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip>
        </div>
        <Select
          value={granularity}
          variant="secondary"
          onValueChange={(value) => {
            if (value) setGranularity(value);
          }}
        >
          <Select.Trigger xstyle={styles.select} aria-labelledby={labelId}>
            <Select.Value>
              {(value) =>
                granularityOptions.find((option) => option.id === value)?.label ??
                "Select granularity"
              }
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popover>
                <Select.List>
                  {granularityOptions.map((option) => (
                    <Select.Item key={option.id} value={option.id}>
                      <Select.ItemText>{option.label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popover>
            </Select.Positioner>
          </Select.Portal>
        </Select>
      </div>
    </div>
  );
}
