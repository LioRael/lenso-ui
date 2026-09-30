"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import { type ComponentProps } from "react";
import { skeletonStyles, skeletonAnimations } from "@lenso/tokens/skeleton";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const Root = styledPart("div", "skeleton", skeletonStyles.root);
export type SkeletonRootProps = StyleXProps<ComponentProps<"div">> & {
  animationType?: keyof typeof skeletonAnimations;
};
export function SkeletonRoot({
  animationType = "shimmer",
  children,
  xstyle,
  ...props
}: SkeletonRootProps) {
  return (
    <Root
      aria-hidden="true"
      {...props}
      data-skeleton-animation={animationType}
      xstyle={[skeletonAnimations[animationType], xstyle]}
    >
      {children}
    </Root>
  );
}
export const Skeleton = Object.assign(SkeletonRoot, { Root: SkeletonRoot });
export type SkeletonProps = SkeletonRootProps;
export type Skeleton = { Props: SkeletonProps; RootProps: SkeletonRootProps };
