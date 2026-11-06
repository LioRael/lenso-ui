"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface NumberFieldStoryProps extends Pick<
  StoryComponentProps<typeof NumberField>,
  "disabled" | "required" | "readOnly" | "variant" | "fullWidth"
> {
  defaultValue: number;
  min: number;
  max: number;
  step: number;
}
export const initialArgs: NumberFieldStoryProps = /* story-args:start */ {
  defaultValue: 1024,
  min: 0,
  max: 4096,
  step: 1,
  disabled: false,
  required: false,
  readOnly: false,
  variant: "primary",
  fullWidth: false,
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Label, NumberField, TextField } from "@lenso/ui";
import { Controls, styles } from "../en/number-field/parts";

export function Basic(overrides: NumberFieldStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <TextField name="width" xstyle={styles.field}>
      <NumberField key={args.defaultValue} name="width" {...args}>
        <Label>Width</Label>
        <Controls />
      </NumberField>
    </TextField>
  );
}
