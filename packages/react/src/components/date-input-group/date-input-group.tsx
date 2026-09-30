"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright NextUI Inc. Apache-2.0.
 * Modified for Lenso StyleX; RAC segmented input and contexts retained.
 */
import { DateInput, DateSegment } from "react-aria-components/DateField";
import { Group } from "react-aria-components/Group";
import type { ComponentPropsWithRef } from "react";
import { dateInputGroupStyles as styles } from "@lenso/tokens/date-input-group";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
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
export const DateInputGroupInput = styledPart(DateInput, "date-input-group-input", styles.input);
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
export const DateInputGroupInputContainer = styledPart(
  "div",
  "date-input-group-input-container",
  styles.inputContainer,
);
export const DateInputGroupPrefix = styledPart("div", "date-input-group-prefix", styles.prefix);
export const DateInputGroupSuffix = styledPart("div", "date-input-group-suffix", styles.suffix);
