"use client";
/**
 * Derived from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI native value/onValueChange contract.
 */
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { radioGroupStyles } from "@lenso/tokens/radio-group";
import type { ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";
import { RadioVariantContext, type RadioVariant } from "../radio/radio.js";

const Root = styledPart(BaseRadioGroup, "radio-group", radioGroupStyles.root);
export type RadioGroupRootProps = ComponentPropsWithRef<typeof Root> & { variant?: RadioVariant };
export function RadioGroupRoot({ variant = "primary", ...props }: RadioGroupRootProps) {
  return (
    <RadioVariantContext value={variant}>
      <Root {...props} />
    </RadioVariantContext>
  );
}
