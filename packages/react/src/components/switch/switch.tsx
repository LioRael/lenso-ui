"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI checked state and semantic input; scoped size composition.
 */
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { switchStyles } from "@lenso/tokens/switch";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";

type SwitchSize = "sm" | "md" | "lg";
const SizeContext = createContext<SwitchSize>("md");
export type SwitchRootProps = StyleXProps<
  Omit<BaseSwitch.Root.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSwitch.Root>["ref"];
  }
> & { "data-slot"?: unknown; size?: SwitchSize };
export function SwitchRoot({ size = "md", xstyle, style, ...props }: SwitchRootProps) {
  const compiled = stylex.props(
    switchStyles.root,
    size === "sm" && switchStyles.rootSm,
    size === "lg" && switchStyles.rootLg,
    xstyle,
  );
  return (
    <SizeContext value={size}>
      <BaseSwitch.Root
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "switch"}
      />
    </SizeContext>
  );
}
export function SwitchContent({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.content, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "switch-content"}
    />
  );
}
function Control({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.control, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "switch-control"}
    />
  );
}
export type SwitchControlProps = ComponentPropsWithRef<typeof Control>;
export function SwitchControl({ xstyle, ...props }: SwitchControlProps) {
  const size = useContext(SizeContext);
  return (
    <Control
      {...props}
      xstyle={[
        size === "sm" && switchStyles.controlSm,
        size === "lg" && switchStyles.controlLg,
        xstyle,
      ]}
    />
  );
}
function Thumb({
  xstyle,
  style,
  ...props
}: StyleXProps<
  Omit<BaseSwitch.Thumb.Props, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof BaseSwitch.Thumb>["ref"];
  }
> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.thumb, xstyle);
  return (
    <BaseSwitch.Thumb
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "switch-thumb"}
    />
  );
}
export type SwitchThumbProps = ComponentPropsWithRef<typeof Thumb>;
export function SwitchThumb({ xstyle, ...props }: SwitchThumbProps) {
  const size = useContext(SizeContext);
  return (
    <Thumb
      {...props}
      xstyle={[
        size === "sm" && switchStyles.thumbSm,
        size === "lg" && switchStyles.thumbLg,
        xstyle,
      ]}
    />
  );
}
export function SwitchIcon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "switch-icon"}
    />
  );
}
export type SwitchContentProps = ComponentPropsWithRef<typeof SwitchContent>;
export type SwitchIconProps = ComponentPropsWithRef<typeof SwitchIcon>;
