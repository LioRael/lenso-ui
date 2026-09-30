"use client";
/**
 * Derived from HeroUI v3.2.6. Copyright 2026 HeroUI.
 * SPDX-License-Identifier: Apache-2.0
 * Modified: Base UI checked state and semantic input; scoped size composition.
 */
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { switchStyles } from "@lenso/tokens/switch";
import { createContext, useContext, type ComponentPropsWithRef } from "react";
import { styledPart } from "../../utils/styled.js";

type SwitchSize = "sm" | "md" | "lg";
const SizeContext = createContext<SwitchSize>("md");
const Root = styledPart(BaseSwitch.Root, "switch", switchStyles.root);
export type SwitchRootProps = ComponentPropsWithRef<typeof Root> & { size?: SwitchSize };
export function SwitchRoot({ size = "md", xstyle, ...props }: SwitchRootProps) {
  return (
    <SizeContext value={size}>
      <Root
        {...props}
        xstyle={[
          size === "sm" && switchStyles.rootSm,
          size === "lg" && switchStyles.rootLg,
          xstyle,
        ]}
      />
    </SizeContext>
  );
}
export const SwitchContent = styledPart("span", "switch-content", switchStyles.content);
const Control = styledPart("span", "switch-control", switchStyles.control);
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
const Thumb = styledPart(BaseSwitch.Thumb, "switch-thumb", switchStyles.thumb);
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
export const SwitchIcon = styledPart("span", "switch-icon", switchStyles.icon);
export type SwitchContentProps = ComponentPropsWithRef<typeof SwitchContent>;
export type SwitchIconProps = ComponentPropsWithRef<typeof SwitchIcon>;
