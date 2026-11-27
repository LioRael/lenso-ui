import AvatarRoot from "./avatar-root.svelte";
import AvatarImage from "./avatar-image.svelte";
import AvatarFallback from "./avatar-fallback.svelte";

export { AvatarRoot, AvatarImage, AvatarFallback };
export const Avatar: typeof AvatarRoot & {
  Root: typeof AvatarRoot;
  Image: typeof AvatarImage;
  Fallback: typeof AvatarFallback;
} = Object.assign(AvatarRoot, {
  Root: AvatarRoot,
  Image: AvatarImage,
  Fallback: AvatarFallback,
});
