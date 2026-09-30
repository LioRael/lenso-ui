"use client";
// Adapted from HeroUI v3.2.6 (Apache-2.0); native Base UI range and selection contracts.
import { NumberField, ProgressBar, Select, Separator } from "@lenso/ui";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
const formatStyleOptions = [
  { label: "Currency", value: "currency" },
  { label: "Percent", value: "percent" },
  { label: "Decimal", value: "decimal" },
  { label: "Unit", value: "unit" },
];
const formatOptionsMap: Record<string, Intl.NumberFormatOptions> = {
  currency: { currency: "USD", style: "currency" },
  decimal: { style: "decimal" },
  percent: { style: "percent" },
  unit: { style: "unit", unit: "mile" },
};
const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    flexDirection: { default: "column", "@media (min-width: 768px)": "row" },
    alignItems: { default: "stretch", "@media (min-width: 768px)": "center" },
    gap: { default: 24, "@media (min-width: 768px)": 40 },
  },
  preview: { display: "flex", width: "100%", maxWidth: 448, flex: 1, justifyContent: "center" },
  progress: { width: "100%", maxWidth: 208 },
  horizontal: { display: { default: "block", "@media (min-width: 768px)": "none" } },
  vertical: { display: { default: "none", "@media (min-width: 768px)": "block" } },
  options: { display: "flex", maxWidth: 208, flexDirection: "column", gap: 12 },
  caption: { fontSize: 12, lineHeight: "16px", fontWeight: 500, color: "var(--muted)" },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 14, lineHeight: "20px", fontWeight: 500 },
});
export function CustomValue() {
  const valueId = useId();
  const minId = useId();
  const maxId = useId();
  const [value, setValue] = useState(750);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1000);
  const [format, setFormat] = useState("percent");
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.preview)}>
        <ProgressBar
          aria-label="Revenue"
          xstyle={styles.progress}
          format={formatOptionsMap[format]}
          max={maxValue}
          min={minValue}
          value={value}
        >
          <ProgressBar.Label>Progress</ProgressBar.Label>
          <ProgressBar.Output />
          <ProgressBar.Track>
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      </div>
      <Separator xstyle={styles.horizontal} />
      <Separator xstyle={styles.vertical} orientation="vertical" />
      <div {...stylex.props(styles.options)}>
        <p {...stylex.props(styles.caption)}>Options</p>
        <NumberField
          id={valueId}
          min={minValue}
          max={maxValue}
          value={value}
          variant="secondary"
          onValueChange={(next) => {
            if (next !== null) setValue(next);
          }}
        >
          <label htmlFor={valueId} {...stylex.props(styles.label)}>
            Value
          </label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <NumberField
          id={minId}
          min={0}
          max={maxValue - 1}
          value={minValue}
          variant="secondary"
          onValueChange={(next) => {
            if (next === null) return;
            setMinValue(next);
            setValue((current) => Math.max(next, current));
          }}
        >
          <label htmlFor={minId} {...stylex.props(styles.label)}>
            Min Value
          </label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <NumberField
          id={maxId}
          min={minValue + 1}
          max={2000}
          value={maxValue}
          variant="secondary"
          onValueChange={(next) => {
            if (next === null) return;
            setMaxValue(next);
            setValue((current) => Math.min(next, current));
          }}
        >
          <label htmlFor={maxId} {...stylex.props(styles.label)}>
            Max Value
          </label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
        <div {...stylex.props(styles.field)}>
          <Select
            variant="secondary"
            value={format}
            items={formatStyleOptions}
            onValueChange={(next) => {
              if (next !== null) setFormat(next);
            }}
          >
            <Select.Label>Format</Select.Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner>
                <Select.Popover>
                  <Select.List>
                    {formatStyleOptions.map((option) => (
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
      </div>
    </div>
  );
}
export default CustomValue;
