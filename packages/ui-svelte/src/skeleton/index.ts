import SkeletonRoot from "./skeleton-root.svelte";

export { SkeletonRoot };
export const Skeleton: typeof SkeletonRoot & {
  Root: typeof SkeletonRoot;
} = Object.assign(SkeletonRoot, {
  Root: SkeletonRoot,
});
