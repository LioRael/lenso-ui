"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX and local RAC support parts.
 */
import { use, type ComponentPropsWithRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { ColorField as Primitive, ColorFieldStateContext } from "react-aria-components/ColorField";
import { Label } from "react-aria-components/Label";
import { Text } from "react-aria-components/Text";
import { FieldError } from "react-aria-components/FieldError";
import { labelStyles } from "@lenso/tokens/label";
import { colorFieldStyles as styles } from "@lenso/tokens/color-field";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type ColorFieldRootProps = StyleXProps<ComponentPropsWithRef<typeof Primitive>> & {
  fullWidth?: boolean;
};
export function ColorFieldRoot({ fullWidth, xstyle, style, ...props }: ColorFieldRootProps) {
  const compiled = stylex.props(styles.root, fullWidth && styles.fullWidth, xstyle);
  return (
    <Primitive
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "color-field"}
      data-required={props.isRequired || undefined}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function ColorFieldLabel({
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
export function ColorFieldDescription({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Text>>) {
  const state = use(ColorFieldStateContext);
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
export function ColorFieldError({
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
export type { Color as ColorValue } from "react-aria-components/ColorArea";
