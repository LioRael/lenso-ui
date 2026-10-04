"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX and local RAC support parts.
 */
import { use, type ComponentPropsWithRef } from "react";
import {
  TimeField as Primitive,
  TimeFieldStateContext,
  type TimeValue,
} from "react-aria-components/TimeField";
import { Label } from "react-aria-components/Label";
import { Text } from "react-aria-components/Text";
import { FieldError } from "react-aria-components/FieldError";
import * as stylex from "@stylexjs/stylex";
import { labelStyles } from "@lenso/tokens/label";
import { timeFieldStyles as styles } from "@lenso/tokens/time-field";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type TimeFieldRootProps<T extends TimeValue> = StyleXProps<
  ComponentPropsWithRef<typeof Primitive<T>>
> & { fullWidth?: boolean };
export function TimeFieldRoot<T extends TimeValue>({
  fullWidth,
  xstyle,
  style,
  ...props
}: TimeFieldRootProps<T>) {
  const compiled = stylex.props(styles.root, fullWidth && styles.fullWidth, xstyle);
  return (
    <Primitive<T>
      {...props}
      {...compiled}
      data-slot="time-field"
      data-required={props.isRequired || undefined}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function TimeFieldLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Label>>) {
  const compiled = stylex.props(
    labelStyles.label,
    labelStyles.contextualRequired,
    styles.label,
    xstyle,
  );
  return (
    <Label
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "label"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function TimeFieldDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Text>>) {
  const state = use(TimeFieldStateContext);
  const compiled = stylex.props(
    styles.description,
    state?.displayValidation.isInvalid && styles.hidden,
    xstyle,
  );
  return (
    <Text
      slot="description"
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "description"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function TimeFieldError({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof FieldError>>) {
  const compiled = stylex.props(styles.error, xstyle);
  return (
    <FieldError
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "field-error"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
