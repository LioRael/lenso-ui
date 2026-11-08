"use client";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { stepperStyles } from "@lenso/tokens/stepper";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type StepperRootProps = StyleXProps<BaseNumberField.Root.Props>;
export function StepperRoot({ xstyle, style, ...props }: StepperRootProps) {
  const compiled = stylex.props(stepperStyles.root, xstyle);
  return (
    <BaseNumberField.Root
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Root.State>(compiled.style, style)}
      data-slot="stepper"
    />
  );
}
export type StepperGroupProps = StyleXProps<BaseNumberField.Group.Props>;
export function StepperGroup({ xstyle, style, children, ...props }: StepperGroupProps) {
  const compiled = stylex.props(stepperStyles.group, xstyle);
  return (
    <BaseNumberField.Group
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Group.State>(compiled.style, style)}
      data-slot="stepper-group"
    >
      {children}
      <span aria-hidden="true" {...stylex.props(stepperStyles.separator)} />
    </BaseNumberField.Group>
  );
}
export type StepperInputProps = StyleXProps<BaseNumberField.Input.Props>;
export function StepperInput({ xstyle, style, ...props }: StepperInputProps) {
  const compiled = stylex.props(stepperStyles.input, xstyle);
  return (
    <BaseNumberField.Input
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Input.State>(compiled.style, style)}
      data-slot="stepper-input"
    />
  );
}
export type StepperIncrementButtonProps = StyleXProps<BaseNumberField.Increment.Props>;
export function StepperIncrementButton({
  xstyle,
  style,
  children = "+",
  ...props
}: StepperIncrementButtonProps) {
  const compiled = stylex.props(stepperStyles.button, stepperStyles.increment, xstyle);
  return (
    <BaseNumberField.Increment
      aria-label="Increase value"
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Increment.State>(compiled.style, style)}
      data-slot="stepper-increment"
    >
      {children}
    </BaseNumberField.Increment>
  );
}
export type StepperDecrementButtonProps = StyleXProps<BaseNumberField.Decrement.Props>;
export function StepperDecrementButton({
  xstyle,
  style,
  children = "−",
  ...props
}: StepperDecrementButtonProps) {
  const compiled = stylex.props(stepperStyles.button, stepperStyles.decrement, xstyle);
  return (
    <BaseNumberField.Decrement
      aria-label="Decrease value"
      {...props}
      {...compiled}
      style={mergeStyle<BaseNumberField.Decrement.State>(compiled.style, style)}
      data-slot="stepper-decrement"
    >
      {children}
    </BaseNumberField.Decrement>
  );
}
export const Stepper = Object.assign(StepperRoot, {
  Root: StepperRoot,
  Group: StepperGroup,
  Input: StepperInput,
  IncrementButton: StepperIncrementButton,
  DecrementButton: StepperDecrementButton,
});
export type StepperProps = StepperRootProps;
