"use client";
/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: UI SDK owns checked state, validation, input and keyboard behavior.
 */
import {
  Checkbox as SdkCheckbox,
  CheckboxIndicator as SdkCheckboxIndicator,
} from "@ui-sdk/react/checkbox";
import { slotRender } from "../../utils/sdk-render.js";
import { checkboxStyles } from "@lenso/tokens/checkbox";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";

export type CheckboxVariant = "primary" | "secondary";
export const CheckboxVariantContext = createContext<CheckboxVariant>("primary");
export type CheckboxRootProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkCheckbox>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkCheckbox>["ref"];
  }
> & { "data-lenso-slot"?: unknown; variant?: CheckboxVariant };
export function CheckboxRoot({ variant, xstyle, style, ...props }: CheckboxRootProps) {
  const compiled = stylex.props(checkboxStyles.root, xstyle);
  const inherited = useContext(CheckboxVariantContext);
  return (
    <CheckboxVariantContext value={variant ?? inherited}>
      <SdkCheckbox
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        render={slotRender("button", props["data-lenso-slot"] ?? "checkbox", props.render)}
      />
    </CheckboxVariantContext>
  );
}
export function CheckboxContent({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(checkboxStyles.content, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "checkbox-content"}
    />
  );
}
function Control({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(checkboxStyles.control, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "checkbox-control"}
    />
  );
}
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
function Indicator({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkCheckboxIndicator>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkCheckboxIndicator>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(checkboxStyles.indicator, xstyle);
  return (
    <SdkCheckboxIndicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("span", props["data-lenso-slot"] ?? "checkbox-indicator", props.render)}
    />
  );
}
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
