"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "./parts";

export function FullWidth() {
  return (
    <div {...stylex.props(styles.wide)}>
      <TextField name="width" fullWidth>
        <NumberField fullWidth defaultValue={1024} min={0} name="width">
          <Label>Width</Label>
          <NumberField.Group>
            <NumberField.DecrementButton />
            <NumberField.Input />
            <NumberField.IncrementButton />
          </NumberField.Group>
        </NumberField>
      </TextField>
    </div>
  );
}
