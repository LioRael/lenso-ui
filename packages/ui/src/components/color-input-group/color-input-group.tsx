"use client";
// Modified: Base UI controls with content-area color input styling.
import { Input as BaseInput } from "@base-ui/react/input";
import { NumberField } from "@base-ui/react/number-field";
import { useRender } from "@base-ui/react/use-render";
import { mergeProps } from "@base-ui/react/merge-props";
import type { ComponentPropsWithRef, CSSProperties, PointerEvent, Ref } from "react";
import * as stylex from "@stylexjs/stylex";
import { colorInputGroupStyles as styles } from "@lenso/tokens/color-input-group";
import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { useColorFieldModel } from "../color-field/color-field.js";
import { useFocusMethodRef } from "../../utils/interaction/focus-method.js";
export type ColorInputGroupRootProps = StyleXProps<useRender.ComponentProps<"div">> & {
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
  return useRender({
    defaultTagName: "div",
    render,
    ref: focusRef,
    props: mergeProps(compiled, props, {
      role: "group",
      "data-slot": props["data-slot"] ?? "color-input-group",
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
  });
}
export type ColorInputGroupInputProps = StyleXProps<
  Omit<ComponentPropsWithRef<typeof BaseInput>, "style" | "ref">
> & {
  ref?: Ref<HTMLInputElement>;
  style?: CSSProperties | ((state: BaseInput.State) => CSSProperties | undefined);
};
export function ColorInputGroupInput({
  xstyle,
  style,
  onValueChange,
  onBlur,
  onKeyDown,
  ...props
}: ColorInputGroupInputProps) {
  const { model, channel, isReadOnly, isRequired, isDisabled, inputProps } = useColorFieldModel();
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
      <NumberField.Input
        {...channelInputProps}
        {...props}
        {...compiled}
        data-slot={props["data-slot"] ?? "color-input-group-input"}
        style={mergeStyle(compiled.style, style)}
        onFocus={(event) => {
          fieldFocus?.(event);
          onFocusChange?.(true);
          props.onFocus?.(event);
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
    <BaseInput
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
        if (!details.isCanceled && model.validate(value)) model.setInputValue(value);
      }}
      onFocus={(event) => {
        fieldFocus?.(event);
        onFocusChange?.(true);
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        fieldBlur?.(event);
        onFocusChange?.(false);
        onBlur?.(event);
        model.commit();
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
          action();
        }
      }}
      data-slot={props["data-slot"] ?? "color-input-group-input"}
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
      data-slot={props["data-slot"] ?? "color-input-group-prefix"}
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
      data-slot={props["data-slot"] ?? "color-input-group-suffix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
