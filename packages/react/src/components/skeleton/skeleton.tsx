"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { type ComponentProps } from "react";
import { skeletonStyles, skeletonAnimations } from "@lenso/tokens/skeleton";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type SkeletonRootProps = StyleXProps<ComponentProps<"div">> & {
  animationType?: keyof typeof skeletonAnimations;
};
export function SkeletonRoot({
  animationType = "shimmer",
  children,
  xstyle,
  style,
  ...props
}: SkeletonRootProps) {
  const compiled = stylex.props(skeletonStyles.root, skeletonAnimations[animationType], xstyle);
  return (
    <div
      aria-hidden="true"
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "skeleton"}
      data-skeleton-animation={animationType}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    >
      {children}
    </div>
  );
}
export const Skeleton = Object.assign(SkeletonRoot, { Root: SkeletonRoot });
export type SkeletonProps = SkeletonRootProps;
export type Skeleton = { Props: SkeletonProps; RootProps: SkeletonRootProps };
