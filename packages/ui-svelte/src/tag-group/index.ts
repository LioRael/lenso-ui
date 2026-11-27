import TagGroupRoot from "./tag-group-root.svelte";
import TagGroupList from "./tag-group-list.svelte";

export { TagGroupRoot, TagGroupList };
export const TagGroup: typeof TagGroupRoot & {
  Root: typeof TagGroupRoot;
  List: typeof TagGroupList;
} = Object.assign(TagGroupRoot, {
  Root: TagGroupRoot,
  List: TagGroupList,
});

export type { TagGroupRootProps } from "./tag-group-root.svelte";
export type { TagGroupItem, TagGroupController } from "./context.js";
export { createModelController as createTagGroupController } from "@lenso/primitives/model-control";

export { TagGroupContext } from "./context.js";
