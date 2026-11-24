import { avatarGroupStyles } from "@lenso/tokens/avatar-group";
import { htmlPart } from "./parts.js";

export const AvatarGroupRoot = htmlPart<"div", { isGrid?: boolean }>(
  "div",
  "avatar-group",
  (props) => [avatarGroupStyles.root, props.isGrid && avatarGroupStyles.grid],
  "isGrid",
);
export const AvatarGroupCount = htmlPart("span", "avatar-group-count", () => undefined);

export const AvatarGroup = Object.assign(AvatarGroupRoot, {
  Root: AvatarGroupRoot,
  Count: AvatarGroupCount,
});
