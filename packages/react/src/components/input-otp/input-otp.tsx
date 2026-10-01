"use client";
// HeroUI v3.2.6, Apache-2.0. Slots are real Base OTP inputs, not painted copies of a hidden input.
import * as React from "react";
import { OTPField } from "@base-ui/react/otp-field";
import { inputOTPStyles } from "@lenso/tokens/input-otp";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
const Variant = React.createContext<"primary" | "secondary">("primary");
export type InputOTPRootProps = StyleXProps<OTPField.Root.Props> & {
  variant?: "primary" | "secondary";
  "data-slot"?: unknown;
};
export function InputOTPRoot({
  variant = "primary",
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: InputOTPRootProps) {
  const compiled = stylex.props(inputOTPStyles.root, xstyle);
  return (
    <Variant value={variant}>
      <OTPField.Root
        {...props}
        {...compiled}
        style={mergeStyle<OTPField.Root.State>(compiled.style, style)}
        data-slot={slot ?? "input-otp"}
      />
    </Variant>
  );
}
export function InputOTPGroup({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(inputOTPStyles.group, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "input-otp-group"}
    />
  );
}
export function InputOTPSlot({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<OTPField.Input.Props> & { "data-slot"?: unknown }) {
  const variant = React.useContext(Variant);
  const compiled = stylex.props(
    inputOTPStyles.slot,
    variant === "secondary" && inputOTPStyles.secondary,
    xstyle,
  );
  return (
    <OTPField.Input
      {...props}
      {...compiled}
      style={mergeStyle<OTPField.Input.State>(compiled.style, style)}
      data-slot={slot ?? "input-otp-slot"}
    />
  );
}
export function InputOTPSeparator({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(inputOTPStyles.separator, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot={slot ?? "input-otp-separator"}
    />
  );
}
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
