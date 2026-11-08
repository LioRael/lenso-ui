"use client";

import { Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "../../en/number-field/parts";
export function Variants() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["primary", "secondary"] as const).map((variant) => (
        <TextField key={variant} name={`${variant}-width`}>
          <NumberField defaultValue={100} min={0} name={`${variant}-width`} variant={variant}>
            <Label>{variant === "primary" ? "主要变体" : "次要变体"}</Label>
            <Controls />
          </NumberField>
        </TextField>
      ))}
    </div>
  );
}
