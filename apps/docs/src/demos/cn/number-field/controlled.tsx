// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Description, Label, NumberField, TextField } from "@lenso/ui";
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
        <Button variant="tertiary" onClick={() => setValue(0)}>
          重置为 0
        </Button>
        <Button variant="tertiary" onClick={() => setValue(2048)}>
          设为 2048
        </Button>
      </div>
    </div>
  );
}
