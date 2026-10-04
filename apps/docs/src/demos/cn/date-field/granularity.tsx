// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// HeroUI v3.2.6. Copyright NextUI Inc. SPDX-License-Identifier: Apache-2.0.
import type { DateValue } from "@internationalized/date";
import { CircleQuestion } from "@gravity-ui/icons";
import { DateField, Select, Tooltip } from "@lenso/ui";
import { parseDate, parseZonedDateTime } from "@internationalized/date";
import { useState, useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/date-field/demo-styles";
export function Granularity() {
  const granularityOptions = [
    {
      id: "day",
      label: "日",
    },
    {
      id: "hour",
      label: "时",
    },
    {
      id: "minute",
      label: "分",
    },
    {
      id: "second",
      label: "秒",
    },
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
        <DateField.Label>预约日期</DateField.Label>
        <DateField.Group>
          <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
        </DateField.Group>
      </DateField>
      <div {...stylex.props(styles.selector)}>
        <div {...stylex.props(styles.selectorLabel)}>
          <span id={labelId}>粒度</span>
          <Tooltip>
            <Tooltip.Trigger delay={0} aria-label="粒度说明">
              <CircleQuestion {...stylex.props(styles.icon)} aria-hidden="true" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner side="bottom" align="start">
                <Tooltip.Popup>
                  <p>决定日期选择器显示的最小单位。默认情况下，日期为「日」，时间为「分」。</p>
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
