"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX; RAC Group/Input context retained.
 */
import { Group } from "react-aria-components/Group";
import { Input } from "react-aria-components/Input";
import type { ComponentPropsWithRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { colorInputGroupStyles as styles } from "@lenso/tokens/color-input-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { racPart } from "../date-input-group/rac-part.js";

export type ColorInputGroupRootProps = StyleXProps<ComponentPropsWithRef<typeof Group>> & {
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
};
const Root = racPart(
  Group,
  "color-input-group",
  (state: {
    isHovered: boolean;
    isFocusWithin: boolean;
    isInvalid: boolean;
    isDisabled: boolean;
  }) => [
    styles.root,
    state.isHovered && styles.hovered,
    state.isFocusWithin && styles.focused,
    state.isInvalid && styles.invalid,
    state.isDisabled && styles.disabled,
  ],
);
export function ColorInputGroupRoot({
  fullWidth,
  variant = "primary",
  xstyle,
  ...props
}: ColorInputGroupRootProps) {
  return (
    <Root
      {...props}
      xstyle={[fullWidth && styles.fullWidth, variant === "secondary" && styles.secondary, xstyle]}
    />
  );
}
export function ColorInputGroupInput({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Input>>) {
  const compiled = stylex.props(styles.input, xstyle);
  return (
    <Input
      {...props}
      {...compiled}
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
