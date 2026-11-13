"use client";
/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: UI SDK owns group selection, validation and keyboard behavior.
 */
import { Radio as SdkRadio, RadioIndicator as SdkRadioIndicator } from "@ui-sdk/react/radio";
import { slotRender } from "../../utils/sdk-render.js";
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
  Omit<React.ComponentProps<typeof SdkRadio>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkRadio>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.root, xstyle);
  return (
    <SdkRadio
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("button", props["data-lenso-slot"] ?? "radio", props.render)}
    />
  );
}
export type RadioVariant = "primary" | "secondary";
export const RadioVariantContext = createContext<RadioVariant>("primary");
export function RadioContent({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.content, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "radio-content"}
    />
  );
}
function Control({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.control, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "radio-control"}
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
  Omit<React.ComponentProps<typeof SdkRadioIndicator>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkRadioIndicator>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(radioStyles.indicator, xstyle);
  return (
    <SdkRadioIndicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("span", props["data-lenso-slot"] ?? "radio-indicator", props.render)}
    />
  );
}
export type RadioIndicatorProps = ComponentPropsWithRef<typeof Indicator>;
export function RadioIndicator(props: RadioIndicatorProps) {
  return <Indicator keepMounted {...props} />;
}
export type RadioRootProps = ComponentPropsWithRef<typeof RadioRoot>;
export type RadioContentProps = ComponentPropsWithRef<typeof RadioContent>;
