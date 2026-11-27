import { skeletonStyles, skeletonAnimations } from "@lenso/tokens/skeleton";
import { htmlPart } from "./parts.js";

export const SkeletonRoot = htmlPart<"div", { animationType?: keyof typeof skeletonAnimations }>(
  "div",
  "skeleton",
  (props) => [skeletonStyles.root, skeletonAnimations[props.animationType ?? "pulse"]],
  "animationType",
);

export const Skeleton: typeof SkeletonRoot & {
  Root: typeof SkeletonRoot;
} = Object.assign(SkeletonRoot, {
  Root: SkeletonRoot,
});
