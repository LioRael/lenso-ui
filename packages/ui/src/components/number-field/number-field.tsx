"use client";
import * as React from "react";
import {
  NumberInput as SdkNumberInput,
  NumberInputGroup as SdkNumberInputGroup,
  NumberInputControl as SdkNumberInputControl,
  NumberInputIncrement as SdkNumberInputIncrement,
  NumberInputDecrement as SdkNumberInputDecrement,
  NumberInputScrubArea as SdkNumberInputScrubArea,
  NumberInputScrubAreaCursor as SdkNumberInputScrubAreaCursor,
  type NumberInputState,
  type NumberInputButtonState,
} from "@ui-sdk/react/number-input";
import { slotRender } from "../../utils/sdk-render.js";
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
export type NumberFieldRootProps = StyleXProps<React.ComponentProps<typeof SdkNumberInput>> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  "data-lenso-slot"?: unknown;
};
export function NumberFieldRoot({
  variant = "primary",
  fullWidth = false,
  xstyle,
  style,
  "data-lenso-slot": slot,
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
      <SdkNumberInput
        {...props}
        {...compiled}
        style={mergeStyle<NumberInputState>(compiled.style, style)}
        render={slotRender("div", slot ?? "number-field", props.render)}
      />
    </Appearance>
  );
}
export function NumberFieldGroup({
  ref,
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkNumberInputGroup>> & {
  "data-lenso-slot"?: unknown;
}) {
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
    <SdkNumberInputGroup
      {...props}
      ref={glassRef}
      {...compiled}
      style={mergeStyle<NumberInputState>(compiled.style, style)}
      render={slotRender("div", slot ?? "number-field-group", props.render)}
    />
  );
}
export function NumberFieldInput({
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkNumberInputControl>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(numberFieldStyles.input, inputGroupMaterialStyles.input, xstyle);
  return (
    <SdkNumberInputControl
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputState>(compiled.style, style)}
      render={slotRender("input", slot ?? "number-field-input", props.render)}
    />
  );
}
export function NumberFieldIncrementButton({
  children = "+",
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkNumberInputIncrement>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(numberFieldStyles.button, numberFieldStyles.increment, xstyle);
  return (
    <SdkNumberInputIncrement
      aria-label="Increase value"
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputButtonState>(compiled.style, style)}
      render={slotRender("button", slot ?? "number-field-increment-button", props.render)}
    >
      {children}
    </SdkNumberInputIncrement>
  );
}
export function NumberFieldDecrementButton({
  children = "−",
  xstyle,
  style,
  "data-lenso-slot": slot,
  ...props
}: StyleXProps<React.ComponentProps<typeof SdkNumberInputDecrement>> & {
  "data-lenso-slot"?: unknown;
}) {
  const compiled = stylex.props(numberFieldStyles.button, numberFieldStyles.decrement, xstyle);
  return (
    <SdkNumberInputDecrement
      aria-label="Decrease value"
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputButtonState>(compiled.style, style)}
      render={slotRender("button", slot ?? "number-field-decrement-button", props.render)}
    >
      {children}
    </SdkNumberInputDecrement>
  );
}
export const NumberField = Object.assign(NumberFieldRoot, {
  Root: NumberFieldRoot,
  Group: NumberFieldGroup,
  Input: NumberFieldInput,
  IncrementButton: NumberFieldIncrementButton,
  DecrementButton: NumberFieldDecrementButton,
  ScrubArea: SdkNumberInputScrubArea,
  ScrubAreaCursor: SdkNumberInputScrubAreaCursor,
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
