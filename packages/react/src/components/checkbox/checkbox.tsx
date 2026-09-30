"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI owns checked state, validation, input and keyboard behavior.
 */
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { checkboxStyles } from "@lenso/tokens/checkbox";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
import * as stylex from "@stylexjs/stylex";

export type CheckboxVariant = "primary" | "secondary";
export const CheckboxVariantContext = createContext<CheckboxVariant>("primary");
const Root = styledPart(BaseCheckbox.Root, "checkbox", checkboxStyles.root);
export type CheckboxRootProps = ComponentPropsWithRef<typeof Root> & { variant?: CheckboxVariant };
export function CheckboxRoot({ variant, ...props }: CheckboxRootProps) {
  const inherited = useContext(CheckboxVariantContext);
  return (
    <CheckboxVariantContext value={variant ?? inherited}>
      <Root {...props} />
    </CheckboxVariantContext>
  );
}
export const CheckboxContent = styledPart("span", "checkbox-content", checkboxStyles.content);
const Control = styledPart("span", "checkbox-control", checkboxStyles.control);
export type CheckboxControlProps = StyleXProps<ComponentPropsWithRef<"span">> & {
  variant?: CheckboxVariant;
};
export function CheckboxControl({ variant, xstyle, ...props }: CheckboxControlProps) {
  const inherited = useContext(CheckboxVariantContext);
  return (
    <Control
      {...props}
      xstyle={[(variant ?? inherited) === "secondary" && checkboxStyles.secondary, xstyle]}
    />
  );
}
const Indicator = styledPart(
  BaseCheckbox.Indicator,
  "checkbox-indicator",
  checkboxStyles.indicator,
);
export type CheckboxIndicatorProps = ComponentPropsWithRef<typeof Indicator>;
export function CheckboxIndicator({ children, ...props }: CheckboxIndicatorProps) {
  return (
    <Indicator keepMounted {...props}>
      {children ?? (
        <>
          <svg
            {...stylex.props(checkboxStyles.checkmark)}
            viewBox="0 0 17 18"
            fill="none"
            aria-hidden="true"
            stroke="currentColor"
            strokeDasharray={22}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 9 7 14 15 4" />
          </svg>
          <svg
            {...stylex.props(checkboxStyles.indeterminate)}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
          >
            <line x1="21" x2="3" y1="12" y2="12" />
          </svg>
        </>
      )}
    </Indicator>
  );
}
export type CheckboxContentProps = ComponentPropsWithRef<typeof CheckboxContent>;
