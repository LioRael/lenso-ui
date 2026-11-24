import { breadcrumbsStyles } from "@lenso/tokens/breadcrumbs";
import { htmlPart } from "./parts.js";

export const BreadcrumbsRoot = htmlPart("ol", "breadcrumbs", () => breadcrumbsStyles.root);
export const BreadcrumbsItem = htmlPart("li", "breadcrumbs-item", () => breadcrumbsStyles.item);
export const BreadcrumbsSeparator = htmlPart(
  "span",
  "breadcrumbs-separator",
  () => breadcrumbsStyles.separator,
);

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Root: BreadcrumbsRoot,
  Item: BreadcrumbsItem,
  Separator: BreadcrumbsSeparator,
});
