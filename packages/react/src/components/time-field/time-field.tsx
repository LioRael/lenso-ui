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
import { timeFieldStyles as styles } from "@lenso/tokens/time-field";
import { styledPart, mergeStyle, type StyleXProps } from "../../utils/styled.js";

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
export const TimeFieldLabel = styledPart(Label, "label", styles.label);
const Description = styledPart(Text, "description", styles.description);
export function TimeFieldDescription({
  xstyle,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Text>>) {
  const state = use(TimeFieldStateContext);
  return (
    <Description
      slot="description"
      {...props}
      xstyle={[state?.displayValidation.isInvalid && styles.hidden, xstyle]}
    />
  );
}
export const TimeFieldError = styledPart(FieldError, "field-error", styles.error);
