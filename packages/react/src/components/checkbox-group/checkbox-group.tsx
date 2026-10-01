"use client";
/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI native value/onValueChange contract.
 */
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { CheckboxVariantContext, type CheckboxVariant } from "../checkbox/checkbox.js";

export type CheckboxGroupRootProps = StyleXProps<
  Omit<BaseCheckboxGroup.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseCheckboxGroup>["ref"];
  }
> & { "data-slot"?: unknown; variant?: CheckboxVariant };
export function CheckboxGroupRoot({
  variant = "primary",
  xstyle,
  style,
  ...props
}: CheckboxGroupRootProps) {
  const compiled = stylex.props(checkboxGroupStyles.root, xstyle);
  return (
    <CheckboxVariantContext value={variant}>
      <BaseCheckboxGroup
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "checkbox-group"}
      />
    </CheckboxVariantContext>
  );
}
export type CheckboxGroupProps = CheckboxGroupRootProps;
