"use client";
// HeroUI v3.2.6, Apache-2.0.
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { useRender } from "@base-ui/react/use-render";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { FieldScope } from "../textfield/field-scope.js";
const supportingStyles = [descriptionStyles.description, checkboxSupportingStyles.direct];
function StandaloneElement({ render, ref, style, ...props }: Field.Description.Props) {
  const state: { [Key in keyof Field.Description.State]: Field.Description.State[Key] } = {
    disabled: false,
    touched: false,
    dirty: false,
    valid: null,
    filled: false,
    focused: false,
  };
  return useRender({
    defaultTagName: "span",
    render,
    ref,
    state,
    props: { ...props, style: typeof style === "function" ? style(state) : style },
  });
}
export function DescriptionRoot({
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: StyleXProps<Field.Description.Props> & { "data-slot"?: unknown }) {
  const inField = React.useContext(FieldScope);
  const compiled = stylex.props(supportingStyles, xstyle);
  const merged = mergeStyle<Field.Description.State>(compiled.style, style);
  if (inField)
    return (
      <Field.Description
        {...props}
        {...compiled}
        style={merged}
        data-slot={slot ?? "description"}
      />
    );
  return (
    <StandaloneElement {...props} {...compiled} style={merged} data-slot={slot ?? "description"} />
  );
}
export const Description = Object.assign(DescriptionRoot, { Root: DescriptionRoot });
export type DescriptionRootProps = React.ComponentProps<typeof DescriptionRoot>;
export type DescriptionProps = DescriptionRootProps;
