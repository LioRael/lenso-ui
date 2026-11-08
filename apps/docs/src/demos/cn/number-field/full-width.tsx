"use client";

import { Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/number-field/parts";
export function FullWidth() {
  return (
    <div {...stylex.props(styles.wide)}>
      <TextField name="width" fullWidth>
        <NumberField fullWidth defaultValue={1024} min={0} name="width">
          <Label>宽度</Label>
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
