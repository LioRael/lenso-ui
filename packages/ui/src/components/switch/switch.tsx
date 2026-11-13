"use client";
/**
 * Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: UI SDK checked state and semantic input; scoped size composition.
 */
import { Switch as SdkSwitch, SwitchThumb as SdkSwitchThumb } from "@ui-sdk/react/switch";
import { slotRender } from "../../utils/sdk-render.js";
import { switchStyles } from "@lenso/tokens/switch";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { KnobMaterial } from "../../utils/materials/knob.js";
import { useSwitchRef } from "../../utils/interaction/switch.js";

type SwitchSize = "sm" | "md" | "lg";
const SizeContext = createContext<SwitchSize>("md");
export type SwitchRootProps = StyleXProps<
  Omit<React.ComponentProps<typeof SdkSwitch>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSwitch>["ref"];
  }
> & { "data-lenso-slot"?: unknown; size?: SwitchSize };
export function SwitchRoot({ size = "md", xstyle, style, ref, ...props }: SwitchRootProps) {
  const presentationRef = useSwitchRef(ref);
  const compiled = stylex.props(
    switchStyles.root,
    size === "sm" && switchStyles.rootSm,
    size === "lg" && switchStyles.rootLg,
    xstyle,
  );
  return (
    <SizeContext value={size}>
      <SdkSwitch
        {...props}
        {...compiled}
        ref={presentationRef}
        style={mergeStyle(compiled.style, style)}
        render={slotRender("button", props["data-lenso-slot"] ?? "switch", props.render)}
      />
    </SizeContext>
  );
}
export function SwitchContent({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.content, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "switch-content"}
    />
  );
}
function Control({
  xstyle,
  style,
  children,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.control, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "switch-control"}
    >
      <span
        aria-hidden="true"
        data-lenso-slot="switch-track"
        {...stylex.props(switchStyles.track)}
      />
      {children}
    </span>
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
  children,
  ...props
}: StyleXProps<
  Omit<React.ComponentProps<typeof SdkSwitchThumb>, "ref"> & {
    ref?: React.ComponentPropsWithRef<typeof SdkSwitchThumb>["ref"];
  }
> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.thumb, xstyle);
  return (
    <SdkSwitchThumb
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("span", props["data-lenso-slot"] ?? "switch-thumb", props.render)}
    >
      {(state) => (
        <>
          <KnobMaterial kind="toggle" controlEdge />
          {typeof children === "function" ? children(state) : children}
        </>
      )}
    </SdkSwitchThumb>
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
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-lenso-slot"?: unknown }) {
  const compiled = stylex.props(switchStyles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-lenso-slot={props["data-lenso-slot"] ?? "switch-icon"}
    />
  );
}
export type SwitchContentProps = ComponentPropsWithRef<typeof SwitchContent>;
export type SwitchIconProps = ComponentPropsWithRef<typeof SwitchIcon>;
