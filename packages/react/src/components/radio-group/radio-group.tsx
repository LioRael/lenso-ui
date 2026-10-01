"use client";
/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI native value/onValueChange contract.
 */
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { radioGroupStyles } from "@lenso/tokens/radio-group";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { RadioVariantContext, type RadioVariant } from "../radio/radio.js";

export type RadioGroupRootProps = StyleXProps<
  Omit<BaseRadioGroup.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseRadioGroup>["ref"];
  }
> & { "data-slot"?: unknown; variant?: RadioVariant };
export function RadioGroupRoot({
  variant = "primary",
  xstyle,
  style,
  ...props
}: RadioGroupRootProps) {
  const compiled = stylex.props(radioGroupStyles.root, xstyle);
  return (
    <RadioVariantContext value={variant}>
      <BaseRadioGroup
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "radio-group"}
      />
    </RadioVariantContext>
  );
}
