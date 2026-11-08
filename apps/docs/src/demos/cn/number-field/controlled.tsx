"use client";

import { GlassButton, Description, Label, NumberField, TextField } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "../../en/number-field/parts";
export function Controlled() {
  const [value, setValue] = useState<number | null>(1024);
  return (
    <div {...stylex.props(styles.column)}>
      <TextField name="width">
        <NumberField min={0} name="width" value={value} onValueChange={setValue}>
          <Label>宽度</Label>
          <Controls />
          <Description>当前值：{value}</Description>
        </NumberField>
      </TextField>
      <div {...stylex.props(styles.row)}>
        <GlassButton variant="default" onClick={() => setValue(0)}>
          重置为 0
        </GlassButton>
        <GlassButton variant="default" onClick={() => setValue(2048)}>
          设为 2048
        </GlassButton>
      </div>
    </div>
  );
}
