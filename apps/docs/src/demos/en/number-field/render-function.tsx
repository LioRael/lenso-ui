"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, NumberField, TextField } from "@lenso/ui";
import { Controls, styles } from "./parts";

export function RenderFunction() {
  return (
    <TextField name="width" xstyle={styles.field}>
      <NumberField
        defaultValue={1024}
        min={0}
        name="width"
        render={(props) => <div {...props} data-custom="foo" />}
      >
        <Label>Width</Label>
        <Controls />
      </NumberField>
    </TextField>
  );
}
