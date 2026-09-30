"use client";
/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI native value/onValueChange contract.
 */
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
import type { ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";
import { CheckboxVariantContext, type CheckboxVariant } from "../checkbox/checkbox.js";

const Root = styledPart(BaseCheckboxGroup, "checkbox-group", checkboxGroupStyles.root);
export type CheckboxGroupRootProps = ComponentPropsWithRef<typeof Root> & {
  variant?: CheckboxVariant;
};
export function CheckboxGroupRoot({ variant = "primary", ...props }: CheckboxGroupRootProps) {
  return (
    <CheckboxVariantContext value={variant}>
      <Root {...props} />
    </CheckboxVariantContext>
  );
}
export type CheckboxGroupProps = CheckboxGroupRootProps;
