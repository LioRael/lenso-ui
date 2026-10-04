// Generated source-backed helper adaptation from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

/** HeroUI v3.2.6 adapted example controls. Copyright NextUI Inc. Apache-2.0. Base UI owns select and switch interaction. */
import { Select, Switch } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { useId } from "react";
export type Granularity = "day" | "hour" | "minute" | "second";
export type HourCycle = 12 | 24;
export const formatStyles = stylex.create({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  rangeStack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
  },
  field: {
    width: "fit-content",
    minWidth: 288,
  },
  rangeField: {
    width: "max-content",
    minWidth: 320,
  },
  releaseField: {
    width: "100%",
    maxWidth: 288,
    minWidth: 320,
  },
  popover: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  rangePopover: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    maxWidth: 252,
  },
  releasePopover: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
  },
  times: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  options: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
  },
  option: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  select: {
    width: 120,
  },
  switches: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 320,
  },
  rangeSwitches: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 529,
  },
  selected: {
    marginTop: 4,
    fontSize: 12,
    color: "var(--muted)",
  },
  separator: {
    marginTop: 20,
    marginBottom: 20,
  },
  heading: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--muted)",
  },
  label: {
    fontSize: 14,
    lineHeight: "20px",
    fontWeight: 500,
    color: "var(--foreground)",
  },
});
const granularityOptions: {
  label: string;
  value: Granularity;
}[] = [
  {
    label: "日",
    value: "day",
  },
  {
    label: "时",
    value: "hour",
  },
  {
    label: "分",
    value: "minute",
  },
  {
    label: "秒",
    value: "second",
  },
];
const hourCycleOptions: {
  label: string;
  value: HourCycle;
}[] = [
  {
    label: "12 小时制",
    value: 12,
  },
  {
    label: "24 小时制",
    value: 24,
  },
];
function OptionSelect<T extends string | number>({
  label,
  value,
  options,
  onChange,
  name,
}: {
  label: string;
  value: T;
  options: {
    label: string;
    value: T;
  }[];
  onChange: (value: T) => void;
  name?: string;
}) {
  const id = useId();
  return (
    <div {...stylex.props(formatStyles.option)}>
      <label {...stylex.props(formatStyles.label)} htmlFor={id}>
        {label}
      </label>
      <Select
        value={value}
        items={options}
        variant="secondary"
        name={name}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <Select.Trigger id={id} xstyle={formatStyles.select}>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popover>
              <Select.List>
                {options.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
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
  );
}
export function FormatControls({
  granularity,
  setGranularity,
  hourCycle,
  setHourCycle,
  hideTimeZone,
  setHideTimeZone,
  shouldForceLeadingZeros,
  setShouldForceLeadingZeros,
  range = false,
}: {
  granularity: Granularity;
  setGranularity: (value: Granularity) => void;
  hourCycle: HourCycle;
  setHourCycle: (value: HourCycle) => void;
  hideTimeZone: boolean;
  setHideTimeZone: (value: boolean) => void;
  shouldForceLeadingZeros: boolean;
  setShouldForceLeadingZeros: (value: boolean) => void;
  range?: boolean;
}) {
  return (
    <>
      <div {...stylex.props(formatStyles.options)}>
        <OptionSelect
          label="粒度"
          name={range ? "granularity" : undefined}
          value={granularity}
          options={granularityOptions}
          onChange={setGranularity}
        />
        <OptionSelect
          label="小时制"
          value={hourCycle}
          options={hourCycleOptions}
          onChange={setHourCycle}
        />
      </div>
      <div {...stylex.props(range ? formatStyles.rangeSwitches : formatStyles.switches)}>
        <Switch checked={hideTimeZone} onCheckedChange={setHideTimeZone} aria-label="隐藏时区">
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            隐藏时区
          </Switch.Content>
        </Switch>
        <Switch
          checked={shouldForceLeadingZeros}
          onCheckedChange={setShouldForceLeadingZeros}
          aria-label="强制前导零"
        >
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            强制前导零
          </Switch.Content>
        </Switch>
      </div>
    </>
  );
}
