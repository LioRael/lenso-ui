"use client";
// SDK owns the single native input and exposes visual slots.
import * as React from "react";
import {
  OTPInput as SdkOTPInput,
  OTPInputSlot as SdkOTPInputSlot,
  type OTPInputState,
  type OTPInputSlotState,
} from "@ui-sdk/react/otp-input";
import { slotRender } from "../../utils/sdk-render.js";
import { inputOTPStyles } from "@lenso/tokens/input-otp";
import { useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
const Variant = React.createContext<"primary" | "secondary">("primary");
const Glass = React.createContext(false);
export type InputOTPRootProps = StyleXProps<React.ComponentProps<typeof SdkOTPInput>> & {
  variant?: "primary" | "secondary";
  /** Use the shared glass material for a code input floating above content. */
  glass?: boolean;
  "data-lenso-slot"?: unknown;
};
export function InputOTPRoot({
  variant = "primary",
  glass = false,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: InputOTPRootProps) {
  const compiled = stylex.props(inputOTPStyles.root, xstyle);
  return (
    <Variant value={variant}>
      <Glass value={glass}>
        <SdkOTPInput
          {...props}
          {...compiled}
          style={mergeStyle<OTPInputState>(compiled.style, style)}
          render={slotRender("div", slot ?? "input-otp", props.render)}
        />
      </Glass>
    </Variant>
  );
}
export function InputOTPGroup({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(inputOTPStyles.group, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "input-otp-group"}
    />
  );
}
export function InputOTPSlot({
  ref,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkOTPInputSlot>> & { "data-lenso-slot"?: unknown }) {
  const variant = React.useContext(Variant);
  const glass = React.useContext(Glass);
  const inputRef = useFocusMethodRef(useGlassRef(ref, glass));
  const compiled = stylex.props(
    glass && liquidMaterialStyles.small,
    inputOTPStyles.slot,
    !glass && variant === "secondary" && inputOTPStyles.secondary,
    glass && inputOTPStyles.glass,
    xstyle,
  );
  return (
    <SdkOTPInputSlot
      {...props}
      {...compiled}
      ref={inputRef}
      style={mergeStyle<OTPInputSlotState>(compiled.style, style)}
      render={slotRender("div", slot ?? "input-otp-slot", props.render)}
    />
  );
}
export function InputOTPSeparator({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(inputOTPStyles.separator, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-lenso-slot={slot ?? "input-otp-separator"}
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
