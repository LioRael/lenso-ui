"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "./parts";

export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <TextField disabled name="width">
        <NumberField disabled defaultValue={1024} min={0} name="width">
          <Label>Width</Label>
          <Controls />
          <Description>Enter the width in pixels</Description>
        </NumberField>
      </TextField>
      <TextField disabled name="percentage">
        <NumberField
          disabled
          defaultValue={0.5}
          format={{ style: "percent" }}
          min={0}
          max={1}
          name="percentage"
          step={0.1}
        >
          <Label>Percentage</Label>
          <Controls />
          <Description>Value must be between 0 and 100</Description>
        </NumberField>
      </TextField>
    </div>
  );
}
