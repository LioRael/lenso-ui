"use client";

import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "../../en/number-field/parts";
export function Required() {
  return (
    <div {...stylex.props(styles.column)}>
      <TextField name="quantity">
        <NumberField required min={0} name="quantity">
          <Label required>数量</Label>
          <Controls />
        </NumberField>
      </TextField>
      <TextField name="rating">
        <NumberField required defaultValue={1} min={1} max={10} name="rating">
          <Label required>评分</Label>
          <Controls />
          <Description>评分范围 1 到 10</Description>
        </NumberField>
      </TextField>
    </div>
  );
}
