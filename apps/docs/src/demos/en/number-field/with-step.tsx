"use client";
import { Description, Label, NumberField, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Controls, styles } from "./parts";

export function WithStep() {
  return (
    <div {...stylex.props(styles.column)}>
      {[1, 5, 10].map((step) => (
        <TextField key={step} name={`step${step}`}>
          <NumberField defaultValue={0} min={0} max={100} step={step} name={`step${step}`}>
            <Label>Step: {step}</Label>
            <Controls />
            <Description>Increments by {step}</Description>
          </NumberField>
        </TextField>
      ))}
    </div>
  );
}
