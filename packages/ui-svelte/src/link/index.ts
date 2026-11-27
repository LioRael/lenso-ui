import LinkRoot from "./link-root.svelte";
import LinkIcon from "./link-icon.svelte";

export { LinkRoot, LinkIcon };
export const Link: typeof LinkRoot & {
  Root: typeof LinkRoot;
  Icon: typeof LinkIcon;
} = Object.assign(LinkRoot, {
  Root: LinkRoot,
  Icon: LinkIcon,
});
