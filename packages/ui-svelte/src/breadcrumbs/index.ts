import BreadcrumbsRoot from "./breadcrumbs-root.svelte";
import BreadcrumbsItem from "./breadcrumbs-item.svelte";
import BreadcrumbsSeparator from "./breadcrumbs-separator.svelte";

export { BreadcrumbsRoot, BreadcrumbsItem, BreadcrumbsSeparator };
export const Breadcrumbs: typeof BreadcrumbsRoot & {
  Root: typeof BreadcrumbsRoot;
  Item: typeof BreadcrumbsItem;
  Separator: typeof BreadcrumbsSeparator;
} = Object.assign(BreadcrumbsRoot, {
  Root: BreadcrumbsRoot,
  Item: BreadcrumbsItem,
  Separator: BreadcrumbsSeparator,
});
