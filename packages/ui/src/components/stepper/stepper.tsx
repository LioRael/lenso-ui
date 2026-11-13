"use client";
import {
  NumberInput as SdkNumberInput,
  NumberInputGroup as SdkNumberInputGroup,
  NumberInputControl as SdkNumberInputControl,
  NumberInputIncrement as SdkNumberInputIncrement,
  NumberInputDecrement as SdkNumberInputDecrement,
  type NumberInputState,
  type NumberInputButtonState,
} from "@ui-sdk/react/number-input";
import { IconMinus, IconPlus } from "../../icons/index.js";
import { slotRender } from "../../utils/sdk-render.js";
import { stepperStyles } from "@lenso/tokens/stepper";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type StepperRootProps = StyleXProps<React.ComponentProps<typeof SdkNumberInput>>;
export function StepperRoot({ xstyle, style, ...props }: StepperRootProps) {
  const compiled = stylex.props(stepperStyles.root, xstyle);
  return (
    <SdkNumberInput
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputState>(compiled.style, style)}
      render={slotRender("div", "stepper", props.render)}
    />
  );
}
export type StepperGroupProps = StyleXProps<React.ComponentProps<typeof SdkNumberInputGroup>>;
export function StepperGroup({ xstyle, style, children, ...props }: StepperGroupProps) {
  const compiled = stylex.props(stepperStyles.group, xstyle);
  return (
    <SdkNumberInputGroup
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputState>(compiled.style, style)}
      render={slotRender("div", "stepper-group", props.render)}
    >
      {(state) => (
        <>
          {typeof children === "function" ? children(state) : children}
          <span aria-hidden="true" {...stylex.props(stepperStyles.separator)} />
        </>
      )}
    </SdkNumberInputGroup>
  );
}
export type StepperInputProps = StyleXProps<React.ComponentProps<typeof SdkNumberInputControl>>;
export function StepperInput({ xstyle, style, ...props }: StepperInputProps) {
  const compiled = stylex.props(stepperStyles.input, xstyle);
  return (
    <SdkNumberInputControl
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputState>(compiled.style, style)}
      render={slotRender("input", "stepper-input", props.render)}
    />
  );
}
export type StepperIncrementButtonProps = StyleXProps<
  React.ComponentProps<typeof SdkNumberInputIncrement>
>;
export function StepperIncrementButton({
  xstyle,
  style,
  children = <IconPlus />,
  ...props
}: StepperIncrementButtonProps) {
  const compiled = stylex.props(stepperStyles.button, stepperStyles.increment, xstyle);
  return (
    <SdkNumberInputIncrement
      aria-label="Increase value"
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputButtonState>(compiled.style, style)}
      render={slotRender("button", "stepper-increment", props.render)}
    >
      {children}
    </SdkNumberInputIncrement>
  );
}
export type StepperDecrementButtonProps = StyleXProps<
  React.ComponentProps<typeof SdkNumberInputDecrement>
>;
export function StepperDecrementButton({
  xstyle,
  style,
  children = <IconMinus />,
  ...props
}: StepperDecrementButtonProps) {
  const compiled = stylex.props(stepperStyles.button, stepperStyles.decrement, xstyle);
  return (
    <SdkNumberInputDecrement
      aria-label="Decrease value"
      {...props}
      {...compiled}
      style={mergeStyle<NumberInputButtonState>(compiled.style, style)}
      render={slotRender("button", "stepper-decrement", props.render)}
    >
      {children}
    </SdkNumberInputDecrement>
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
