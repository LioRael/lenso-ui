"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { headerStyles } from "@lenso/tokens/header";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
import type { ComponentProps } from "react";
export function HeaderRoot({ xstyle, style, ...props }: StyleXProps<ComponentProps<"header">>) {
  const compiled = stylex.props(headerStyles.root, xstyle);
  return (
    <header
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "header"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const Header = HeaderRoot;
export type HeaderRootProps = ComponentProps<typeof HeaderRoot>;
export type HeaderProps = HeaderRootProps;
export type Header = { Props: HeaderProps };
