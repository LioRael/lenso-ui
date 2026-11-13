"use client";
import type * as React from "react";
import { FieldError as SdkFieldError, type FieldErrorState } from "@ui-sdk/react/field";
import { slotRender } from "../../utils/sdk-render.js";
import { fieldErrorStyles } from "@lenso/tokens/field-error";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type FieldErrorProps = StyleXProps<React.ComponentProps<typeof SdkFieldError>>;
export function FieldErrorRoot({
  xstyle,
  style,
  render,
  "data-lenso-slot": slot,
  ...props
}: FieldErrorProps) {
  const compiled = stylex.props(
    fieldErrorStyles.error,
    checkboxSupportingStyles.direct,
    checkboxSupportingStyles.error,
    textFieldStyles.supporting,
    xstyle,
  );
  return (
    <SdkFieldError
      {...props}
      {...compiled}
      style={mergeStyle<FieldErrorState>(compiled.style, style)}
      render={slotRender("div", slot ?? "field-error", render)}
    />
  );
}
export const FieldError = Object.assign(FieldErrorRoot, { Root: FieldErrorRoot });
export type FieldErrorRootProps = FieldErrorProps;
