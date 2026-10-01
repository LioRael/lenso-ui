"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import { surfaceStyles, surfaceVariants } from "@lenso/tokens/surface";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type SurfaceRootProps = StyleXProps<ComponentProps<"div">> & {
  variant?: keyof typeof surfaceVariants;
};
export function SurfaceRoot({ variant = "default", xstyle, style, ...props }: SurfaceRootProps) {
  const compiled = stylex.props(surfaceStyles.root, surfaceVariants[variant], xstyle);
  return (
    <div
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "surface"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const Surface = Object.assign(SurfaceRoot, { Root: SurfaceRoot });
export type SurfaceProps = SurfaceRootProps;
export type Surface = { Props: SurfaceProps; RootProps: SurfaceRootProps };
