"use client";
// HeroUI v3.2.6, Apache-2.0.
import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { numberFieldStyles, numberFieldGroupStyles } from "@lenso/tokens/number-field";
import { styledPart } from "../../utils/styled.js";
const Appearance = React.createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
const Root = styledPart(BaseNumberField.Root, "number-field", numberFieldStyles.root);
export type NumberFieldRootProps = React.ComponentProps<typeof Root> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
};
export function NumberFieldRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  ...props
}: NumberFieldRootProps) {
  const appearance = React.useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  return (
    <Appearance value={appearance}>
      <Root {...props} xstyle={[fullWidth && numberFieldGroupStyles.fullWidth, xstyle]} />
    </Appearance>
  );
}
const Group = styledPart(BaseNumberField.Group, "number-field-group", numberFieldGroupStyles.root);
export function NumberFieldGroup({ xstyle, ...props }: React.ComponentProps<typeof Group>) {
  const { variant, fullWidth } = React.useContext(Appearance);
  return (
    <Group
      {...props}
      xstyle={[
        variant === "secondary" && numberFieldGroupStyles.secondary,
        fullWidth && numberFieldGroupStyles.fullWidth,
        xstyle,
      ]}
    />
  );
}
export const NumberFieldInput = styledPart(
  BaseNumberField.Input,
  "number-field-input",
  numberFieldStyles.input,
);
const Increment = styledPart(
  BaseNumberField.Increment,
  "number-field-increment-button",
  numberFieldStyles.button,
);
const Decrement = styledPart(
  BaseNumberField.Decrement,
  "number-field-decrement-button",
  numberFieldStyles.button,
);
export function NumberFieldIncrementButton({
  children = "+",
  xstyle,
  ...props
}: React.ComponentProps<typeof Increment>) {
  return (
    <Increment
      aria-label="Increase value"
      {...props}
      xstyle={[numberFieldStyles.increment, xstyle]}
    >
      {children}
    </Increment>
  );
}
export function NumberFieldDecrementButton({
  children = "−",
  xstyle,
  ...props
}: React.ComponentProps<typeof Decrement>) {
  return (
    <Decrement
      aria-label="Decrease value"
      {...props}
      xstyle={[numberFieldStyles.decrement, xstyle]}
    >
      {children}
    </Decrement>
  );
}
export const NumberField = Object.assign(NumberFieldRoot, {
  Root: NumberFieldRoot,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  IncrementButton: NumberFieldIncrementButton,
  DecrementButton: NumberFieldDecrementButton,
  ScrubArea: BaseNumberField.ScrubArea,
  ScrubAreaCursor: BaseNumberField.ScrubAreaCursor,
});
export type NumberFieldProps = NumberFieldRootProps;
export type NumberFieldGroupProps = React.ComponentProps<typeof NumberFieldGroup>;
export type NumberFieldInputProps = React.ComponentProps<typeof NumberFieldInput>;
export type NumberFieldIncrementButtonProps = React.ComponentProps<
  typeof NumberFieldIncrementButton
>;
export type NumberFieldDecrementButtonProps = React.ComponentProps<
  typeof NumberFieldDecrementButton
>;
