"use client";
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
