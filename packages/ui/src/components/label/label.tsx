"use client";
import type * as React from "react";
import { FieldLabel as SdkFieldLabel, type FieldState } from "@ui-sdk/react/field";
import { slotRender } from "../../utils/sdk-render.js";
import { labelStyles } from "@lenso/tokens/label";
import { textFieldStyles } from "@lenso/tokens/textfield";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type LabelProps = StyleXProps<React.ComponentProps<typeof SdkFieldLabel>> & {
  required?: boolean;
};
export function LabelRoot({
  required = false,
  xstyle,
  style,
  render,
  "data-lenso-slot": slot,
  ...props
}: LabelProps) {
  const compiled = stylex.props(
    labelStyles.label,
    textFieldStyles.rowLabel,
    required && labelStyles.required,
    xstyle,
  );
  return (
    <SdkFieldLabel
      {...props}
      {...compiled}
      style={mergeStyle<FieldState>(compiled.style, style)}
      render={slotRender("label", slot ?? "label", render)}
    />
  );
}
export const Label = Object.assign(LabelRoot, { Root: LabelRoot });
export type LabelRootProps = LabelProps;
