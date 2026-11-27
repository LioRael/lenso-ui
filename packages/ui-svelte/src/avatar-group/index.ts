import AvatarGroupRoot from "./avatar-group-root.svelte";
import AvatarGroupCount from "./avatar-group-count.svelte";

export { AvatarGroupRoot, AvatarGroupCount };
export const AvatarGroup: typeof AvatarGroupRoot & {
  Root: typeof AvatarGroupRoot;
  Count: typeof AvatarGroupCount;
} = Object.assign(AvatarGroupRoot, {
  Root: AvatarGroupRoot,
  Count: AvatarGroupCount,
});
