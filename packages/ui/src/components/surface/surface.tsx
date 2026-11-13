"use client";
// modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import { groupStyles, surfaceStyles, surfaceVariants } from "@lenso/tokens/surface";
import { MaterialBackground } from "../../utils/materials/render.js";
import { materialStyles } from "@lenso/tokens/materials";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type SurfaceRootProps = StyleXProps<ComponentProps<"div">> & {
  variant?: keyof typeof surfaceVariants;
};
export function SurfaceRoot({
  variant = "default",
  xstyle,
  style,
  ref,
  children,
  ...props
}: SurfaceRootProps) {
  const compiled = stylex.props(
    variant === "glass" && materialStyles.root,
    variant === "glass" && materialStyles.thick,
    surfaceStyles.root,
    variant === "default" && groupStyles.surface,
    surfaceVariants[variant],
    variant === "glass" && materialStyles.accessible,
    xstyle,
  );
  return (
    <div
      {...props}
      ref={ref}
      data-variant={variant}
      data-material={variant === "glass" ? "thick" : undefined}
      data-lenso-slot={(props as { "data-lenso-slot"?: string })["data-lenso-slot"] ?? "surface"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    >
      {variant === "glass" && <MaterialBackground variant="thick" />}
      {children}
    </div>
  );
}
export const Surface = Object.assign(SurfaceRoot, { Root: SurfaceRoot });
export type SurfaceProps = SurfaceRootProps;
export type Surface = { Props: SurfaceProps; RootProps: SurfaceRootProps };
