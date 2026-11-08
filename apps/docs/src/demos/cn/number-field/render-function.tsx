"use client";

import { Label, NumberField, TextField } from "@lenso/ui";
import { Controls, styles } from "../../en/number-field/parts";
export function RenderFunction() {
  return (
    <TextField name="width" xstyle={styles.field}>
      <NumberField
        defaultValue={1024}
        min={0}
        name="width"
        render={(props) => <div {...props} data-custom="foo" />}
      >
        <Label>宽度</Label>
        <Controls />
      </NumberField>
    </TextField>
  );
}
