"use client";

import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "../../en/number-field/parts";
export function WithStep() {
  return (
    <div {...stylex.props(styles.column)}>
      {[1, 5, 10].map((step) => (
        <TextField key={step} name={`step${step}`}>
          <NumberField defaultValue={0} min={0} max={100} step={step} name={`step${step}`}>
            <Label>步长：{step}</Label>
            <Controls />
            <Description>每次增减 {step}</Description>
          </NumberField>
        </TextField>
      ))}
    </div>
  );
}
