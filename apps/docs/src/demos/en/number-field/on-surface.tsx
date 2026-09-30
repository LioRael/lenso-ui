"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Description, Label, NumberField, Surface, TextField } from "@lenso/ui";
import { Controls, styles } from "./parts";

export function OnSurface() {
  return (
    <Surface xstyle={styles.surface}>
      <TextField name="width">
        <NumberField defaultValue={1024} min={0} name="width" variant="secondary">
          <Label>Width</Label>
          <Controls fullWidth />
          <Description>Enter the width in pixels</Description>
        </NumberField>
      </TextField>
      <TextField name="percentage">
        <NumberField
          defaultValue={0.5}
          format={{ style: "percent" }}
          min={0}
          max={1}
          name="percentage"
          step={0.1}
          variant="secondary"
        >
          <Label>Percentage</Label>
          <Controls fullWidth />
          <Description>Value must be between 0 and 100</Description>
        </NumberField>
      </TextField>
    </Surface>
  );
}
