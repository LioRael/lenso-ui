import { linkStyles } from "@lenso/tokens/link";
import { htmlPart } from "./parts.js";

export const LinkRoot = htmlPart("a", "link", () => linkStyles.root);
export const LinkIcon = htmlPart("span", "link-icon", () => linkStyles.icon);

export const Link = Object.assign(LinkRoot, {
  Root: LinkRoot,
  Icon: LinkIcon,
});
