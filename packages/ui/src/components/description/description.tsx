"use client";
import type * as React from "react";
import {
  FieldDescription as SdkFieldDescription,
  type FieldDescriptionState,
} from "@ui-sdk/react/field";
import { slotRender } from "../../utils/sdk-render.js";
import { descriptionStyles } from "@lenso/tokens/description";
import { textFieldStyles } from "@lenso/tokens/textfield";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type DescriptionProps = StyleXProps<React.ComponentProps<typeof SdkFieldDescription>>;
export function DescriptionRoot({
  xstyle,
  style,
  render,
  "data-lenso-slot": slot,
  ...props
}: DescriptionProps) {
  const compiled = stylex.props(
    descriptionStyles.description,
    checkboxSupportingStyles.direct,
    textFieldStyles.supporting,
    xstyle,
  );
  return (
    <SdkFieldDescription
      {...props}
      {...compiled}
      style={mergeStyle<FieldDescriptionState>(compiled.style, style)}
      render={slotRender("span", slot ?? "description", render)}
    />
  );
}
export const Description = Object.assign(DescriptionRoot, { Root: DescriptionRoot });
export type DescriptionRootProps = DescriptionProps;
