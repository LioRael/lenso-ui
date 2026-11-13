"use client";
// Modified: UI SDK native value/onValueChange contract.
import { CheckboxGroup as SdkCheckboxGroup } from "@ui-sdk/react/checkbox";
import { slotRender } from "../../utils/sdk-render.js";
import { checkboxGroupStyles } from "@lenso/tokens/checkbox-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { CheckboxVariantContext, type CheckboxVariant } from "../checkbox/checkbox.js";

export type CheckboxGroupRootProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkCheckboxGroup>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkCheckboxGroup>["ref"];
  }
> & { "data-lenso-slot"?: unknown; variant?: CheckboxVariant };
export function CheckboxGroupRoot({
  variant = "primary",
  xstyle,
  style,
  ...props
}: CheckboxGroupRootProps) {
  const compiled = stylex.props(checkboxGroupStyles.root, xstyle);
  return (
    <CheckboxVariantContext value={variant}>
      <SdkCheckboxGroup
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        render={slotRender("div", props["data-lenso-slot"] ?? "checkbox-group", props.render)}
      />
    </CheckboxVariantContext>
  );
}
export type CheckboxGroupProps = CheckboxGroupRootProps;
