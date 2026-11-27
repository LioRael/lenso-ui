import PaginationPreviousIcon from "./pagination-previous-icon.svelte";
export { PaginationPreviousIcon };
import PaginationNextIcon from "./pagination-next-icon.svelte";
export { PaginationNextIcon };
import PaginationRoot from "./pagination-root.svelte";
import PaginationContent from "./pagination-content.svelte";
import PaginationItem from "./pagination-item.svelte";
import PaginationLink from "./pagination-link.svelte";
import PaginationPrevious from "./pagination-previous.svelte";
import PaginationNext from "./pagination-next.svelte";
import PaginationEllipsis from "./pagination-ellipsis.svelte";
import PaginationSummary from "./pagination-summary.svelte";

export {
  PaginationRoot,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationSummary,
};
export const Pagination: typeof PaginationRoot & {
  NextIcon: typeof PaginationNextIcon;
  PreviousIcon: typeof PaginationPreviousIcon;
  Root: typeof PaginationRoot;
  Content: typeof PaginationContent;
  Item: typeof PaginationItem;
  Link: typeof PaginationLink;
  Previous: typeof PaginationPrevious;
  Next: typeof PaginationNext;
  Ellipsis: typeof PaginationEllipsis;
  Summary: typeof PaginationSummary;
} = Object.assign(PaginationRoot, {
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
