"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { FieldError, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "./parts";

export function Validation() {
  return (
    <div {...stylex.props(styles.column)}>
      <TextField invalid name="quantity">
        <NumberField required min={0} name="quantity" value={-5} allowOutOfRange>
          <Label required>Quantity</Label>
          <Controls />
          <FieldError match>Quantity must be greater than or equal to 0</FieldError>
        </NumberField>
      </TextField>
      <TextField invalid name="percentage">
        <NumberField
          format={{ style: "percent" }}
          min={0}
          max={1}
          name="percentage"
          step={0.1}
          value={1.5}
          allowOutOfRange
        >
          <Label>Percentage</Label>
          <Controls />
          <FieldError match>Percentage must be between 0 and 100</FieldError>
        </NumberField>
      </TextField>
    </div>
  );
}
