"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "./parts";

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
    label: "Currency (EUR - Accounting)",
    description: "Accounting format with EUR currency",
    value: 99,
    format: { currency: "EUR", currencySign: "accounting", style: "currency" },
  },
  {
    name: "currency-usd",
    label: "Currency (USD)",
    description: "Standard USD currency format",
    value: 99.99,
    format: { currency: "USD", style: "currency" },
  },
  {
    name: "percentage",
    label: "Percentage",
    description: "Percentage format (0-1, where 0.5 = 50%)",
    value: 0.5,
    format: { style: "percent" },
    max: 1,
    step: 0.01,
  },
  {
    name: "decimal",
    label: "Decimal (2 decimal places)",
    description: "Decimal format with 2 decimal places",
    value: 1234.56,
    format: { maximumFractionDigits: 2, minimumFractionDigits: 2, style: "decimal" },
  },
  {
    name: "unit",
    label: "Unit (Kilograms)",
    description: "Unit format with kilograms",
    value: 1000,
    format: { style: "unit", unit: "kilogram", unitDisplay: "short" },
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
