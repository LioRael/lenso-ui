// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Label, NumberField, TextField } from "@lenso/ui";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  return (
    <TextField name="width" xstyle={demoStyles.field}>
      <Label>宽度</Label>
      <NumberField defaultValue={1024} min={0}>
        <NumberField.Group>
          <NumberField.DecrementButton />
          <NumberField.Input />
          <NumberField.IncrementButton />
        </NumberField.Group>
      </NumberField>
    </TextField>
  );
}
