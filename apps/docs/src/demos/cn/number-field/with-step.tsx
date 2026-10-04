// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
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
