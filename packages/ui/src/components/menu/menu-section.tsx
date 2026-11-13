"use client";
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import * as SdkMenu from "@ui-sdk/react/menu";
import { slotRender } from "../../utils/sdk-render.js";
import { menuSectionStyles as s } from "@lenso/tokens/menu";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export function MenuSectionRoot({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkMenu.MenuGroup>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkMenu.MenuGroup>, "ref">) {
  const compiled = stylex.props(s.root, xstyle);
  return (
    <SdkMenu.MenuGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "menu-section", props.render)}
    />
  );
}
export function MenuSectionLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<React.ComponentProps<typeof SdkMenu.MenuGroupLabel>, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof SdkMenu.MenuGroupLabel>, "ref">) {
  const compiled = stylex.props(s.label, xstyle);
  return (
    <SdkMenu.MenuGroupLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "menu-section-label", props.render)}
    />
  );
}
export const MenuSection = Object.assign(MenuSectionRoot, {
  Root: MenuSectionRoot,
  Label: MenuSectionLabel,
});
