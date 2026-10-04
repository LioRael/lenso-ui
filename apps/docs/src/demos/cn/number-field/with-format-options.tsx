// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "../../en/number-field/parts";
const formats: {
  name: string;
  label: string;
  description: string;
  value: number;
  format: Intl.NumberFormatOptions;
  max?: number;
  step?: number;
}[] = [
  {
    name: "currency-eur",
    label: "货币（EUR - 会计格式）",
    description: "欧元会计记账格式",
    value: 99,
    format: {
      currency: "EUR",
      currencySign: "accounting",
      style: "currency",
    },
  },
  {
    name: "currency-usd",
    label: "货币（USD）",
    description: "标准美元货币格式",
    value: 99.99,
    format: {
      currency: "USD",
      style: "currency",
    },
  },
  {
    name: "percentage",
    label: "百分比",
    description: "百分比格式（0–1，0.5 表示 50%）",
    value: 0.5,
    format: {
      style: "percent",
    },
    max: 1,
    step: 0.01,
  },
  {
    name: "decimal",
    label: "小数（保留 2 位）",
    description: "保留 2 位小数格式",
    value: 1234.56,
    format: {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "decimal",
    },
  },
  {
    name: "unit",
    label: "单位（千克）",
    description: "千克单位格式",
    value: 1000,
    format: {
      style: "unit",
      unit: "kilogram",
      unitDisplay: "short",
    },
  },
];
export function WithFormatOptions() {
  return (
    <div {...stylex.props(styles.column)}>
      {formats.map((item) => (
        <TextField key={item.name} name={item.name}>
          <NumberField
            defaultValue={item.value}
            min={0}
            max={item.max}
            name={item.name}
            format={item.format}
            step={item.step}
          >
            <Label>{item.label}</Label>
            <Controls />
            <Description>{item.description}</Description>
          </NumberField>
        </TextField>
      ))}
    </div>
  );
}
