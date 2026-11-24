import { paginationStyles } from "@lenso/tokens/pagination";
import { htmlPart } from "./parts.js";

export const PaginationRoot = htmlPart("nav", "pagination", () => paginationStyles.root);
export const PaginationContent = htmlPart(
  "ul",
  "pagination-content",
  () => paginationStyles.content,
);
export const PaginationItem = htmlPart("li", "pagination-item", () => paginationStyles.item);
export const PaginationLink = htmlPart("a", "pagination-link", () => paginationStyles.link);
export const PaginationPrevious = htmlPart("a", "pagination-previous", () => paginationStyles.link);
export const PaginationNext = htmlPart("a", "pagination-next", () => paginationStyles.link);
export const PaginationEllipsis = htmlPart(
  "span",
  "pagination-ellipsis",
  () => paginationStyles.ellipsis,
);
export const PaginationSummary = htmlPart(
  "div",
  "pagination-summary",
  () => paginationStyles.summary,
);

export const Pagination = Object.assign(PaginationRoot, {
  Root: PaginationRoot,
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
  Summary: PaginationSummary,
});
