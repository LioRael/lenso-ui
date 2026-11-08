"use client";

import { FieldError, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "../../en/number-field/parts";
export function Validation() {
  return (
    <div {...stylex.props(styles.column)}>
      <TextField invalid name="quantity">
        <NumberField required min={0} name="quantity" value={-5} allowOutOfRange>
          <Label required>数量</Label>
          <Controls />
          <FieldError match>数量必须大于或等于 0</FieldError>
        </NumberField>
      </TextField>
      <TextField invalid name="percentage">
        <NumberField
          format={{
            style: "percent",
          }}
          min={0}
          max={1}
          name="percentage"
          step={0.1}
          value={1.5}
          allowOutOfRange
        >
          <Label>百分比</Label>
          <Controls />
          <FieldError match>百分比必须在 0 到 100 之间</FieldError>
        </NumberField>
      </TextField>
    </div>
  );
}
