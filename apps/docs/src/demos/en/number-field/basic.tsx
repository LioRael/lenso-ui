"use client";

import { Label, NumberField, TextField } from "@lenso/ui";
import { Controls, styles } from "./parts";

export function Basic() {
  return (
    <TextField name="width" xstyle={styles.field}>
      <NumberField defaultValue={1024} min={0} name="width">
        <Label>Width</Label>
        <Controls />
      </NumberField>
    </TextField>
  );
}
