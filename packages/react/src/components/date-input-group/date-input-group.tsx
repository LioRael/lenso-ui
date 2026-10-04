"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX; RAC segmented input and contexts retained.
 */
import { DateInput, DateSegment } from "react-aria-components/DateField";
import { Group } from "react-aria-components/Group";
import type { ComponentPropsWithRef } from "react";
import * as stylex from "@stylexjs/stylex";
import { dateInputGroupStyles as styles } from "@lenso/tokens/date-input-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { racPart } from "./rac-part.js";

type GroupState = {
  isHovered: boolean;
  isFocusWithin: boolean;
  isInvalid: boolean;
  isDisabled: boolean;
};
const Root = racPart(Group, "date-input-group", (state: GroupState) => [
  styles.root,
  state.isHovered && styles.hovered,
  state.isFocusWithin && styles.focused,
  state.isInvalid && styles.invalid,
  state.isDisabled && styles.disabled,
]);
export type DateInputGroupRootProps = StyleXProps<ComponentPropsWithRef<typeof Group>> & {
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
};
export function DateInputGroupRoot({
  fullWidth,
  variant = "primary",
  xstyle,
  ...props
}: DateInputGroupRootProps) {
  return (
    <Root
      {...props}
      xstyle={[fullWidth && styles.fullWidth, variant === "secondary" && styles.secondary, xstyle]}
    />
  );
}
export function DateInputGroupInput({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof DateInput>>) {
  const compiled = stylex.props(styles.input, xstyle);
  return (
    <DateInput
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "date-input-group-input"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export const DateInputGroupSegment = racPart(
  DateSegment,
  "date-input-group-segment",
  (state: {
    type: string;
    isPlaceholder: boolean;
    isFocused: boolean;
    isInvalid: boolean;
    isDisabled: boolean;
  }) => [
    styles.segment,
    state.type === "literal" && styles.literal,
    state.isPlaceholder && styles.placeholder,
    state.isFocused && styles.segmentFocused,
    state.isInvalid && styles.segmentInvalid,
    state.isInvalid && state.isFocused && styles.segmentInvalidFocused,
    state.isDisabled && styles.disabled,
  ],
);
export function DateInputGroupInputContainer({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.inputContainer, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "date-input-group-input-container"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function DateInputGroupPrefix({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.prefix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "date-input-group-prefix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export function DateInputGroupSuffix({
  xstyle,
  style,
  ...props
}: StyleXProps<ComponentPropsWithRef<"div">>) {
  const compiled = stylex.props(styles.suffix, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      data-slot={props["data-slot"] ?? "date-input-group-suffix"}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
