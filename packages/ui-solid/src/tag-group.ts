import { tagGroupStyles } from "@lenso/tokens/tag-group";
import { htmlPart } from "./parts.js";

export const TagGroupRoot = htmlPart("div", "tag-group", () => tagGroupStyles.root);
export const TagGroupList = htmlPart("ul", "tag-group-list", () => tagGroupStyles.list);

export const TagGroup = Object.assign(TagGroupRoot, {
  Root: TagGroupRoot,
  List: TagGroupList,
});
