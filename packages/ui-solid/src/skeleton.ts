import { skeletonStyles, skeletonAnimations } from "@lenso/tokens/skeleton";
import { htmlPart } from "./parts.js";

export const SkeletonRoot = htmlPart<"div", { animationType?: keyof typeof skeletonAnimations }>(
  "div",
  "skeleton",
  (props) => [skeletonStyles.root, skeletonAnimations[props.animationType ?? "pulse"]],
  "animationType",
);

export const Skeleton = Object.assign(SkeletonRoot, {
  Root: SkeletonRoot,
});
