"use client";
// HeroUI v3.2.6, Apache-2.0.
import * as React from "react";
import { Field } from "@base-ui/react/field";
import { useRender } from "@base-ui/react/use-render";
import { descriptionStyles } from "@lenso/tokens/description";
import { checkboxSupportingStyles } from "@lenso/tokens/checkbox";
import { styledPart } from "../../utils/styled.js";
import { FieldScope } from "../textfield/field-scope.js";
const supportingStyles = [descriptionStyles.description, checkboxSupportingStyles.direct];
const Root = styledPart(Field.Description, "description", supportingStyles);
function StandaloneElement({
  render,
  ref,
  style,
  ...props
}: React.ComponentProps<typeof Field.Description>) {
  const state: { [Key in keyof Field.Root.State]: Field.Root.State[Key] } = {
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
const Standalone = styledPart(StandaloneElement, "description", supportingStyles);
export function DescriptionRoot(props: React.ComponentProps<typeof Root>) {
  const inField = React.useContext(FieldScope);
  if (inField) return <Root {...props} />;
  return <Standalone {...props} />;
}
export const Description = Object.assign(DescriptionRoot, { Root: DescriptionRoot });
export type DescriptionRootProps = React.ComponentProps<typeof DescriptionRoot>;
export type DescriptionProps = DescriptionRootProps;
