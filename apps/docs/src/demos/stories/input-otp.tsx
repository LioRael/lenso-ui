"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface InputOTPStoryProps extends Pick<
  StoryComponentProps<typeof InputOTP>,
  "disabled" | "required" | "readOnly" | "variant" | "glass"
> {
  defaultValue: string;
}
export const initialArgs: InputOTPStoryProps = /* story-args:start */ {
  defaultValue: "123456",
  disabled: false,
  glass: false,
  required: false,
  readOnly: false,
  variant: "primary",
}; /* story-args:end */

import { InputOTP, Label, TextField } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { Slots, styles } from "../en/input-otp/parts";
export function Basic(overrides: InputOTPStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <TextField name="code" xstyle={styles.field}>
      <div {...stylex.props(styles.heading)}>
        <Label>Verification code</Label>
        <p {...stylex.props(styles.muted)}>Enter the six-digit code to continue.</p>
      </div>
      <InputOTP length={6} name="code" {...args}>
        <Slots />
      </InputOTP>
    </TextField>
  );
}
