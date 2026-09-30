"use client";
// HeroUI v3.2.6, Apache-2.0. Slots are real Base OTP inputs, not painted copies of a hidden input.
import * as React from "react";
import { OTPField } from "@base-ui/react/otp-field";
import { inputOTPStyles } from "@lenso/tokens/input-otp";
import { styledPart } from "../../utils/styled.js";
const Variant = React.createContext<"primary" | "secondary">("primary");
const Root = styledPart(OTPField.Root, "input-otp", inputOTPStyles.root);
export type InputOTPRootProps = React.ComponentProps<typeof Root> & {
  variant?: "primary" | "secondary";
};
export function InputOTPRoot({ variant = "primary", ...props }: InputOTPRootProps) {
  return (
    <Variant value={variant}>
      <Root {...props} />
    </Variant>
  );
}
export const InputOTPGroup = styledPart("div", "input-otp-group", inputOTPStyles.group);
const Slot = styledPart(OTPField.Input, "input-otp-slot", inputOTPStyles.slot);
export function InputOTPSlot({ xstyle, ...props }: React.ComponentProps<typeof Slot>) {
  const variant = React.useContext(Variant);
  return <Slot {...props} xstyle={[variant === "secondary" && inputOTPStyles.secondary, xstyle]} />;
}
export const InputOTPSeparator = styledPart("div", "input-otp-separator", inputOTPStyles.separator);
export const InputOTP = Object.assign(InputOTPRoot, {
  Root: InputOTPRoot,
  Group: InputOTPGroup,
  Slot: InputOTPSlot,
  Separator: InputOTPSeparator,
});
export type InputOTPProps = InputOTPRootProps;
export type InputOTPGroupProps = React.ComponentProps<typeof InputOTPGroup>;
export type InputOTPSlotProps = React.ComponentProps<typeof InputOTPSlot>;
export type InputOTPSeparatorProps = React.ComponentProps<typeof InputOTPSeparator>;
