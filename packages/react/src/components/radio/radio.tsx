"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI owns group selection, validation and keyboard behavior.
 */
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { radioStyles } from "@lenso/tokens/radio";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { styledPart, type StyleXProps } from "../../utils/styled.js";

export const RadioRoot = styledPart(BaseRadio.Root, "radio", radioStyles.root);
export type RadioVariant = "primary" | "secondary";
export const RadioVariantContext = createContext<RadioVariant>("primary");
export const RadioContent = styledPart("span", "radio-content", radioStyles.content);
const Control = styledPart("span", "radio-control", radioStyles.control);
export type RadioControlProps = StyleXProps<ComponentPropsWithRef<"span">> & {
  variant?: RadioVariant;
};
export function RadioControl({ variant, xstyle, ...props }: RadioControlProps) {
  const inherited = useContext(RadioVariantContext);
  return (
    <Control
      {...props}
      xstyle={[(variant ?? inherited) === "secondary" && radioStyles.secondary, xstyle]}
    />
  );
}
const Indicator = styledPart(BaseRadio.Indicator, "radio-indicator", radioStyles.indicator);
export type RadioIndicatorProps = ComponentPropsWithRef<typeof Indicator>;
export function RadioIndicator(props: RadioIndicatorProps) {
  return <Indicator keepMounted {...props} />;
}
export type RadioRootProps = ComponentPropsWithRef<typeof RadioRoot>;
export type RadioContentProps = ComponentPropsWithRef<typeof RadioContent>;
