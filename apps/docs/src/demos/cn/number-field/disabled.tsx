"use client";

import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "../../en/number-field/parts";
export function Disabled() {
  return (
    <div {...stylex.props(styles.column)}>
      <TextField disabled name="width">
        <NumberField disabled defaultValue={1024} min={0} name="width">
          <Label>宽度</Label>
          <Controls />
          <Description>以像素为单位输入宽度</Description>
        </NumberField>
      </TextField>
      <TextField disabled name="percentage">
        <NumberField
          disabled
          defaultValue={0.5}
          format={{
            style: "percent",
          }}
          min={0}
          max={1}
          name="percentage"
          step={0.1}
        >
          <Label>百分比</Label>
          <Controls />
          <Description>取值须在 0 到 100 之间</Description>
        </NumberField>
      </TextField>
    </div>
  );
}
