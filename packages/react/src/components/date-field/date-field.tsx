"use client";
/**
 * Derived from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e).
 * Copyright NextUI Inc. Apache-2.0. Modified for Lenso StyleX and local RAC support parts.
 */
import { use, type ComponentPropsWithRef } from "react";
import type { DateValue } from "react-aria-components/Calendar";
import { DateField as Primitive, DateFieldStateContext } from "react-aria-components/DateField";
import { DatePickerStateContext } from "react-aria-components/DatePicker";
import { DateRangePickerStateContext } from "react-aria-components/DateRangePicker";
import { Label } from "react-aria-components/Label";
import { Text } from "react-aria-components/Text";
import { FieldError } from "react-aria-components/FieldError";
import * as stylex from "@stylexjs/stylex";
import { dateFieldStyles as styles } from "@lenso/tokens/date-field";
import { styledPart, mergeStyle, type StyleXProps } from "../../utils/styled.js";

export type DateFieldRootProps<T extends DateValue> = StyleXProps<
  ComponentPropsWithRef<typeof Primitive<T>>
> & { fullWidth?: boolean };
export function DateFieldRoot<T extends DateValue>({
  fullWidth,
  xstyle,
  style,
  ...props
}: DateFieldRootProps<T>) {
  const compiled = stylex.props(styles.root, fullWidth && styles.fullWidth, xstyle);
  return (
    <Primitive<T>
      {...props}
      {...compiled}
      data-slot="date-field"
      data-required={props.isRequired || undefined}
      style={mergeStyle(compiled.style, style)}
    />
  );
}
export const DateFieldLabel = styledPart(Label, "label", styles.label);
const Description = styledPart(Text, "description", styles.description);
export function DateFieldDescription({
  xstyle,
  ...props
}: StyleXProps<ComponentPropsWithRef<typeof Text>>) {
  const date = use(DateFieldStateContext);
  const picker = use(DatePickerStateContext);
  const range = use(DateRangePickerStateContext);
  const state = date ?? picker ?? range;
  return (
    <Description
      slot="description"
      {...props}
      xstyle={[state?.displayValidation.isInvalid && styles.hidden, xstyle]}
    />
  );
}
export const DateFieldError = styledPart(FieldError, "field-error", styles.error);
