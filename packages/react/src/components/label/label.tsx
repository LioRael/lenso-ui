"use client";
// HeroUI v3.2.6, Apache-2.0.
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { useRender } from "@base-ui/react/use-render";
import { labelStyles } from "@lenso/tokens/label";
import { styledPart } from "../../utils/styled.js";
import { FieldScope } from "../textfield/field-scope.js";
const Root = styledPart(Field.Label, "label", labelStyles.label);
function StandaloneElement({
  render,
  ref,
  nativeLabel = true,
  style,
  ...props
}: React.ComponentProps<typeof Field.Label>) {
  const state: { [Key in keyof Field.Root.State]: Field.Root.State[Key] } = {
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
const Standalone = styledPart(StandaloneElement, "label", labelStyles.label);
export type LabelProps = React.ComponentProps<typeof Root> & { required?: boolean };
export function LabelRoot({ required = false, xstyle, ...props }: LabelProps) {
  const inField = React.useContext(FieldScope);
  if (!inField) {
    return <Standalone {...props} xstyle={[required && labelStyles.required, xstyle]} />;
  }
  return <Root {...props} xstyle={[required && labelStyles.required, xstyle]} />;
}
export const Label = Object.assign(LabelRoot, { Root: LabelRoot });
export type LabelRootProps = LabelProps;
