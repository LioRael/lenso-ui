import TagRoot from "./tag-root.svelte";
import TagRemoveButton from "./tag-remove-button.svelte";

export { TagRoot, TagRemoveButton };
export const Tag: typeof TagRoot & {
  Root: typeof TagRoot;
  RemoveButton: typeof TagRemoveButton;
} = Object.assign(TagRoot, {
  Root: TagRoot,
  RemoveButton: TagRemoveButton,
});

export type { TagRootProps, TagState } from "./tag-root.svelte";
