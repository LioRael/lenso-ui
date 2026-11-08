"use client";
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
