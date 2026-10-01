"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI owns group selection, validation and keyboard behavior.
 */
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { radioStyles } from "@lenso/tokens/radio";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";

export function RadioRoot({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseRadio.Root.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseRadio.Root>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.root, xstyle);
  return (
    <BaseRadio.Root
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "radio"}
    />
  );
}
export type RadioVariant = "primary" | "secondary";
export const RadioVariantContext = createContext<RadioVariant>("primary");
export function RadioContent({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.content, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "radio-content"}
    />
  );
}
function Control({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.control, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "radio-control"}
    />
  );
}
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
function Indicator({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseRadio.Indicator.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseRadio.Indicator>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.indicator, xstyle);
  return (
    <BaseRadio.Indicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "radio-indicator"}
    />
  );
}
export type RadioIndicatorProps = ComponentPropsWithRef<typeof Indicator>;
export function RadioIndicator(props: RadioIndicatorProps) {
  return <Indicator keepMounted {...props} />;
}
export type RadioRootProps = ComponentPropsWithRef<typeof RadioRoot>;
export type RadioContentProps = ComponentPropsWithRef<typeof RadioContent>;
