"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input as BaseInput } from "@base-ui/react/input";
import { inputStyles } from "@lenso/tokens/input";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type InputProps = StyleXProps<
  Omit<BaseInput.Props, "ref"> & React.RefAttributes<HTMLElement>
> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function InputRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: InputProps) {
  const compiled = stylex.props(
    inputStyles.input,
    variant === "secondary" && inputStyles.secondary,
    fullWidth && inputStyles.fullWidth,
    xstyle,
  );
  return (
    <BaseInput
      {...props}
      {...compiled}
      style={mergeStyle<BaseInput.State>(compiled.style, style)}
      data-slot={slot ?? "input"}
    />
  );
}
export const Input = Object.assign(InputRoot, { Root: InputRoot });
export type InputRootProps = InputProps;
