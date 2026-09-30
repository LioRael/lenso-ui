"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Input as BaseInput } from "@base-ui/react/input";
import { inputStyles } from "@lenso/tokens/input";
import { styledPart } from "../../utils/styled.js";

const Root = styledPart(BaseInput, "input", inputStyles.input);
export type InputProps = React.ComponentProps<typeof Root> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export function InputRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  ...props
}: InputProps) {
  return (
    <Root
      {...props}
      xstyle={[
        variant === "secondary" && inputStyles.secondary,
        fullWidth && inputStyles.fullWidth,
        xstyle,
      ]}
    />
  );
}
export const Input = Object.assign(InputRoot, { Root: InputRoot });
export type InputRootProps = InputProps;
