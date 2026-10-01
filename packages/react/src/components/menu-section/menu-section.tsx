"use client";
// HeroUI v3.2.6 anatomy, Apache-2.0.
import * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { Menu as Base } from "@base-ui/react/menu";
import { menuSectionStyles as s } from "@lenso/tokens/menu-section";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export function MenuSectionRoot({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.Group.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.Group>, "ref">) {
  const compiled = stylex.props(s.root, xstyle);
  return (
    <Base.Group
      {...props}
      {...compiled}
      style={mergeStyle<Base.Group.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-section"}
    />
  );
}
export function MenuSectionLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<Omit<Base.GroupLabel.Props, "ref">> &
  Pick<React.ComponentPropsWithRef<typeof Base.GroupLabel>, "ref">) {
  const compiled = stylex.props(s.label, xstyle);
  return (
    <Base.GroupLabel
      {...props}
      {...compiled}
      style={mergeStyle<Base.GroupLabel.State>(compiled.style, style)}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "menu-section-label"}
    />
  );
}
export const MenuSection = Object.assign(MenuSectionRoot, {
  Root: MenuSectionRoot,
  Label: MenuSectionLabel,
});
