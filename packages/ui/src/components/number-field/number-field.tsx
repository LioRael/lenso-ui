"use client";
import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { numberFieldStyles, numberFieldGroupStyles } from "@lenso/tokens/number-field";
import { glassStyles } from "@lenso/tokens/glass";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { useGlassRef } from "@lenso/glass/react";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
const Appearance = React.createContext({
  variant: "primary" as "primary" | "secondary",
  fullWidth: false,
});
export type NumberFieldRootProps = StyleXProps<BaseNumberField.Root.Props> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-slot"?: unknown;
};
export function NumberFieldRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: NumberFieldRootProps) {
  const appearance = React.useMemo(() => ({ variant, fullWidth }), [variant, fullWidth]);
  const compiled = stylex.props(
    numberFieldStyles.root,
    fullWidth && numberFieldGroupStyles.fullWidth,
    xstyle,
  );
  return (
    <Appearance value={appearance}>
      <BaseNumberField.Root
        {...props}
        {...compiled}
        style={mergeStyle<BaseNumberField.Root.State>(compiled.style, style)}
        data-slot={slot ?? "number-field"}
      />
    </Appearance>
  );
}
export function NumberFieldGroup({
  ref,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseNumberField.Group.Props> & { "data-slot"?: unknown }) {
  const { variant, fullWidth } = React.useContext(Appearance);
  const glassRef = useFocusMethodRef(useGlassRef(ref, true));
  const compiled = stylex.props(
    numberFieldGroupStyles.root,
    glassStyles.optics,
    inputGroupMaterialStyles.root,
    variant === "secondary" && inputGroupMaterialStyles.secondary,
    fullWidth && inputGroupMaterialStyles.fullWidth,
    xstyle,
  );
  return (
    <BaseNumberField.Group
      {...props}
      ref={glassRef}
      {...compiled}
      style={mergeStyle<BaseNumberField.Group.State>(compiled.style, style)}
      data-slot={slot ?? "number-field-group"}
    />
  );
}
export function NumberFieldInput({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseNumberField.Input.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(numberFieldStyles.input, inputGroupMaterialStyles.input, xstyle);
  return (
    <BaseNumberField.Input
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Input.State>(compiled.style, style)}
      data-slot={slot ?? "number-field-input"}
    />
  );
}
export function NumberFieldIncrementButton({
  children = "+",
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseNumberField.Increment.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(numberFieldStyles.button, numberFieldStyles.increment, xstyle);
  return (
    <BaseNumberField.Increment
      aria-label="Increase value"
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Increment.State>(compiled.style, style)}
      data-slot={slot ?? "number-field-increment-button"}
    >
      {children}
    </BaseNumberField.Increment>
  );
}
export function NumberFieldDecrementButton({
  children = "−",
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<BaseNumberField.Decrement.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(numberFieldStyles.button, numberFieldStyles.decrement, xstyle);
  return (
    <BaseNumberField.Decrement
      aria-label="Decrease value"
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Decrement.State>(compiled.style, style)}
      data-slot={slot ?? "number-field-decrement-button"}
    >
      {children}
    </BaseNumberField.Decrement>
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
