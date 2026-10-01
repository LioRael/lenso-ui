"use client";
// HeroUI v3.2.6, Apache-2.0.
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { useRender } from "@base-ui/react/use-render";
import { labelStyles } from "@lenso/tokens/label";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { FieldScope } from "../textfield/field-scope.js";
function StandaloneElement({
  render,
  ref,
  nativeLabel = true,
  style,
  ...props
}: Omit<Field.Label.Props, "ref"> & React.RefAttributes<HTMLElement>) {
  const state: { [Key in keyof Field.Label.State]: Field.Label.State[Key] } = {
    disabled: false,
    touched: false,
    dirty: false,
    valid: null,
    filled: false,
    focused: false,
  };
  return useRender({
    defaultTagName: nativeLabel ? "label" : "span",
    render,
    ref,
    state,
    props: { ...props, style: typeof style === "function" ? style(state) : style },
  });
}
export type LabelProps = StyleXProps<
  Omit<Field.Label.Props, "ref"> & React.RefAttributes<HTMLElement>
> & { required?: boolean; "data-slot"?: unknown };
export function LabelRoot({
  required = false,
  xstyle,
  style,
  "data-slot": slot,
  ...props
}: LabelProps) {
  const inField = React.useContext(FieldScope);
  const compiled = stylex.props(labelStyles.label, required && labelStyles.required, xstyle);
  const merged = mergeStyle<Field.Label.State>(compiled.style, style);
  if (!inField) {
    return (
      <StandaloneElement {...props} {...compiled} style={merged} data-slot={slot ?? "label"} />
    );
  }
  return <Field.Label {...props} {...compiled} style={merged} data-slot={slot ?? "label"} />;
}
export const Label = Object.assign(LabelRoot, { Root: LabelRoot });
export type LabelRootProps = LabelProps;
