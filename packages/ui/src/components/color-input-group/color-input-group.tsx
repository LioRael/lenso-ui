"use client";
// Modified: UI SDK controls with content-area color input styling.
import { Input as SdkInput, type InputState } from "@ui-sdk/react/input";
import { NumberInputControl, type NumberInputState } from "@ui-sdk/react/number-input";
import { renderElement, type PartProps, type RenderProp } from "@ui-sdk/react/primitive";
import { mergeProps } from "@ui-sdk/react/primitive";
import {
  useRef,
  useLayoutEffect,
  useCallback,
  type ComponentPropsWithRef,
  type CSSProperties,
  type PointerEvent,
  type Ref,
} from "react";
import { assignRef } from "../../utils/interaction/ref.js";
import * as stylex from "@stylexjs/stylex";
import { colorInputGroupStyles as styles } from "@lenso/tokens/color-input-group";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useColorFieldModel } from "../color-field/color-field.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
export type ColorInputGroupRootProps = StyleXProps<PartProps<"div">> & {
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
};
export function ColorInputGroupRoot({
  fullWidth,
  variant = "primary",
  ref,
  render,
  xstyle,
  style,
  onPointerDown,
  ...props
}: ColorInputGroupRootProps) {
  const state = useColorFieldModel();
  const focusRef = useFocusMethodRef(ref);
  const compiled = stylex.props(
    styles.root,
    variant === "secondary" && styles.secondary,
    state.isDisabled && styles.disabled,
    state.isInvalid && styles.invalid,
    fullWidth && styles.fullWidth,
    xstyle,
  );
  return renderElement(
    "div",
    {
      ...mergeProps(compiled, props, {
        role: "group",
        "data-lenso-slot": props["data-lenso-slot"] ?? "color-input-group",
        "data-disabled": state.isDisabled || undefined,
        "data-invalid": state.isInvalid || undefined,
        style: mergeStyle(compiled.style, style),
        onPointerDown(event: PointerEvent<HTMLDivElement>) {
          onPointerDown?.(event);
          if (
            !event.defaultPrevented &&
            event.target instanceof Element &&
            !event.target.closest("input,button,a[href],[tabindex]")
          )
            event.currentTarget.querySelector<HTMLInputElement>("input:not(:disabled)")?.focus();
        },
      }),
      ref: focusRef,
    },
    render,
  );
}
export type ColorInputGroupInputProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof SdkInput>, "style" | "ref" | "render">
> & {
  ref?: Ref<HTMLInputElement>;
  render?: RenderProp<InputState | NumberInputState>;
  style?: CSSProperties | ((state: InputState | NumberInputState) => CSSProperties | undefined);
};
export function ColorInputGroupInput({
  xstyle,
  style,
  onValueChange,
  onBlur,
  onKeyDown,
  ref,
  ...props
}: ColorInputGroupInputProps) {
  const { model, control, channel, isReadOnly, isRequired, isDisabled, inputProps } =
    useColorFieldModel();
  const nativeInput = useRef<HTMLInputElement>(null);
  const inputRef = useCallback(
    (node: HTMLInputElement | null) => {
      const own = assignRef(nativeInput, node),
        caller = assignRef(ref, node);
      return () => {
        own();
        caller();
      };
    },
    [ref],
  );
  useLayoutEffect(() => {
    nativeInput.current?.setCustomValidity(model.realtimeValidation.validationErrors.join("\n"));
  });
  const compiled = stylex.props(inputGroupMaterialStyles.input, styles.input, xstyle);
  const {
    name: _name,
    form: _form,
    onFocus: fieldFocus,
    onBlur: fieldBlur,
    onFocusChange,
    ...channelInputProps
  } = inputProps;
  if (channel)
    return (
      <NumberInputControl
        ref={inputRef}
        {...channelInputProps}
        {...props}
        {...compiled}
        data-lenso-slot={props["data-lenso-slot"] ?? "color-input-group-input"}
        style={mergeStyle(compiled.style, style)}
        onFocus={(event) => {
          fieldFocus?.(event);
          onFocusChange?.(true);
          props.onFocus?.(event);
        }}
        onInvalid={(event) => {
          model.commitValidation();
          props.onInvalid?.(event);
        }}
        onBlur={(event) => {
          fieldBlur?.(event);
          onFocusChange?.(false);
          onBlur?.(event);
        }}
        onKeyDown={onKeyDown}
      />
    );
  return (
    <SdkInput
      ref={inputRef}
      {...channelInputProps}
      name={inputProps.name}
      form={inputProps.form}
      {...props}
      {...compiled}
      value={props.value === undefined ? model.inputValue : props.value}
      readOnly={isReadOnly || props.readOnly}
      disabled={isDisabled || props.disabled}
      required={isRequired || props.required}
      onValueChange={(value, details) => {
        onValueChange?.(value, details);
        if (!details.canceled && model.validate(value)) model.setInputValue(value);
      }}
      onFocus={(event) => {
        fieldFocus?.(event);
        onFocusChange?.(true);
        props.onFocus?.(event);
      }}
      onInvalid={(event) => {
        model.commitValidation();
        props.onInvalid?.(event);
      }}
      onBlur={(event) => {
        fieldBlur?.(event);
        onFocusChange?.(false);
        onBlur?.(event);
        control.api.run(() => model.commit(), { reason: "input-commit", event: event.nativeEvent });
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || isDisabled || isReadOnly) return;
        const actions = {
          ArrowUp: model.increment,
          ArrowDown: model.decrement,
          Home: model.decrementToMin,
          End: model.incrementToMax,
          Enter: model.commit,
        };
        const action = actions[event.key as keyof typeof actions];
        if (action) {
          if (event.key !== "Enter") event.preventDefault();
          control.api.run(action, {
            reason: event.key === "Enter" ? "input-commit" : "step-key",
            event: event.nativeEvent,
          });
        }
      }}
      data-lenso-slot={props["data-lenso-slot"] ?? "color-input-group-input"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function ColorInputGroupPrefix({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.prefix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "color-input-group-prefix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function ColorInputGroupSuffix({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.suffix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-lenso-slot={props["data-lenso-slot"] ?? "color-input-group-suffix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
