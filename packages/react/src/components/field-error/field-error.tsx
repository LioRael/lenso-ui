"use client";
// HeroUI v3.2.6, Apache-2.0. Base Field.Error controls mounting and validation linkage.
import { Field } from "@base-ui/react/field";
import { fieldErrorStyles } from "@lenso/tokens/field-error";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
const supportingStyles = [
  fieldErrorStyles.error,
  checkboxSupportingStyles.direct,
  checkboxSupportingStyles.error,
];
export function FieldErrorRoot({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<Field.Error.Props> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(supportingStyles, xstyle);
  return (
    <Field.Error
      {...props}
      {...compiled}
      style={mergeStyle<Field.Error.State>(compiled.style, style)}
      data-slot={slot ?? "field-error"}
    />
  );
}
export const FieldError = Object.assign(FieldErrorRoot, { Root: FieldErrorRoot });
export type FieldErrorRootProps = React.ComponentProps<typeof FieldErrorRoot>;
export type FieldErrorProps = FieldErrorRootProps;
