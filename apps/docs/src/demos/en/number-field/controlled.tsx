"use client";
import { GlassButton, Description, Label, NumberField, TextField } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "./parts";

export function Controlled() {
  const [value, setValue] = useState<number | null>(1024);
  return (
    <div {...stylex.props(styles.column)}>
      <TextField name="width">
        <NumberField min={0} name="width" value={value} onValueChange={setValue}>
          <Label>Width</Label>
          <Controls />
          <Description>Current value: {value}</Description>
        </NumberField>
      </TextField>
      <div {...stylex.props(styles.row)}>
        <GlassButton variant="default" onClick={() => setValue(0)}>
          Reset to 0
        </GlassButton>
        <GlassButton variant="default" onClick={() => setValue(2048)}>
          Set to 2048
        </GlassButton>
      </div>
    </div>
  );
}
