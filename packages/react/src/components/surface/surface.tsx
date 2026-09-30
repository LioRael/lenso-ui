"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import { surfaceStyles, surfaceVariants } from "@lenso/tokens/surface";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const Root = styledPart("div", "surface", surfaceStyles.root);
export type SurfaceRootProps = StyleXProps<ComponentProps<"div">> & {
  variant?: keyof typeof surfaceVariants;
};
export function SurfaceRoot({ variant = "default", xstyle, ...props }: SurfaceRootProps) {
  return <Root {...props} xstyle={[surfaceVariants[variant], xstyle]} />;
}
export const Surface = Object.assign(SurfaceRoot, { Root: SurfaceRoot });
export type SurfaceProps = SurfaceRootProps;
export type Surface = { Props: SurfaceProps; RootProps: SurfaceRootProps };
