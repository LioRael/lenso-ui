import BadgeRoot from "./badge-root.svelte";
import BadgeLabel from "./badge-label.svelte";
import BadgeAnchor from "./badge-anchor.svelte";

export { BadgeRoot, BadgeLabel, BadgeAnchor };
export const Badge: typeof BadgeRoot & {
  Root: typeof BadgeRoot;
  Label: typeof BadgeLabel;
  Anchor: typeof BadgeAnchor;
} = Object.assign(BadgeRoot, {
  Root: BadgeRoot,
  Label: BadgeLabel,
  Anchor: BadgeAnchor,
});
