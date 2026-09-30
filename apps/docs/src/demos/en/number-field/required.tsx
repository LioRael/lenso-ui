"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "./parts";

export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <TextField name="quantity">
        <NumberField required min={0} name="quantity">
          <Label required>Quantity</Label>
          <Controls />
        </NumberField>
      </TextField>
      <TextField name="rating">
        <NumberField required defaultValue={1} min={1} max={10} name="rating">
          <Label required>Rating</Label>
          <Controls />
          <Description>Rate from 1 to 10</Description>
        </NumberField>
      </TextField>
    </div>
  );
}
