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

const PaginationNextIconBase = htmlPart(
  "span",
  "pagination-next-icon",
  () => paginationStyles.icon,
);
export function PaginationNextIcon(props: Parameters<typeof PaginationNextIconBase>[0]) {
  return (
    <PaginationNextIconBase aria-hidden="true" {...props}>
      {props.children ?? (
        <svg viewBox="0 0 16 16" width="100%" height="100%" fill="none">
          <path
            d="m6 4 4 4-4 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </PaginationNextIconBase>
  );
}
const PaginationPreviousIconBase = htmlPart(
  "span",
  "pagination-previous-icon",
  () => paginationStyles.icon,
);
export function PaginationPreviousIcon(props: Parameters<typeof PaginationPreviousIconBase>[0]) {
  return (
    <PaginationPreviousIconBase aria-hidden="true" {...props}>
      {props.children ?? (
        <svg viewBox="0 0 16 16" width="100%" height="100%" fill="none">
          <path
            d="m10 4-4 4 4 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </PaginationPreviousIconBase>
  );
}
export const Pagination = Object.assign(PaginationRoot, {
  NextIcon: PaginationNextIcon,
  PreviousIcon: PaginationPreviousIcon,
  Root: PaginationRoot,
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  Ellipsis: PaginationEllipsis,
  Summary: PaginationSummary,
});
