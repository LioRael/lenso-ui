"use client";

import { createContext, useContext, type ComponentProps } from "react";
import { paginationStyles, paginationSizes, paginationPress } from "@lenso/tokens/pagination";
import { styledPart } from "../../utils/styled.js";
import { LinkRoot, type LinkRootProps } from "../link/link.js";
import type { ButtonSize } from "../button/button.js";
const Context = createContext<ButtonSize>("md");
const Root = styledPart("nav", "pagination", paginationStyles.root);
const Summary = styledPart("div", "pagination-summary", paginationStyles.summary);
export const PaginationContent = styledPart("ul", "pagination-content", paginationStyles.content);
export const PaginationItem = styledPart("li", "pagination-item", paginationStyles.item);
const Ellipsis = styledPart("span", "pagination-ellipsis", paginationStyles.ellipsis);
const PreviousIcon = styledPart("span", "pagination-previous-icon", paginationStyles.icon);
const NextIcon = styledPart("span", "pagination-next-icon", paginationStyles.icon);
export type PaginationRootProps = ComponentProps<typeof Root> & { size?: ButtonSize };
export function PaginationRoot({ size = "md", ...props }: PaginationRootProps) {
  return (
    <Context value={size}>
      <Root aria-label="Pagination" {...props} />
    </Context>
  );
}
export function PaginationSummary({ xstyle, ...props }: ComponentProps<typeof Summary>) {
  const size = useContext(Context);
  return (
    <Summary
      {...props}
      xstyle={[
        size === "sm" && paginationStyles.summarySm,
        size === "lg" && paginationStyles.summaryLg,
        xstyle,
      ]}
    />
  );
}
export type PaginationLinkProps = LinkRootProps & { isActive?: boolean };
export function PaginationLink({ isActive = false, xstyle, ...props }: PaginationLinkProps) {
  const size = useContext(Context);
  return (
    <LinkRoot
      {...props}
      data-slot="pagination-link"
      aria-current={isActive ? "page" : undefined}
      data-active={isActive || undefined}
      xstyle={[
        paginationStyles.link,
        paginationSizes[size],
        paginationPress[size],
        isActive && paginationStyles.active,
        xstyle,
      ]}
    />
  );
}
export function PaginationPrevious({ xstyle, children, ...props }: LinkRootProps) {
  const size = useContext(Context);
  return (
    <PaginationLink
      aria-label="Previous page"
      {...props}
      xstyle={[
        paginationStyles.nav,
        size === "sm" && paginationStyles.navSm,
        size === "lg" && paginationStyles.navLg,
        xstyle,
      ]}
    >
      {children ?? (
        <>
          <PaginationPreviousIcon />
          Previous
        </>
      )}
    </PaginationLink>
  );
}
export function PaginationNext({ xstyle, children, ...props }: LinkRootProps) {
  const size = useContext(Context);
  return (
    <PaginationLink
      aria-label="Next page"
      {...props}
      xstyle={[
        paginationStyles.nav,
        size === "sm" && paginationStyles.navSm,
        size === "lg" && paginationStyles.navLg,
        xstyle,
      ]}
    >
      {children ?? (
        <>
          Next
          <PaginationNextIcon />
        </>
      )}
    </PaginationLink>
  );
}
export function PaginationPreviousIcon({
  children,
  ...props
}: ComponentProps<typeof PreviousIcon>) {
  return (
    <PreviousIcon aria-hidden="true" {...props}>
      {children ?? (
        <svg viewBox="0 0 16 16" width="100%" height="100%" fill="none">
          <path
            d="m10 4-4 4 4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </PreviousIcon>
  );
}
export function PaginationNextIcon({ children, ...props }: ComponentProps<typeof NextIcon>) {
  return (
    <NextIcon aria-hidden="true" {...props}>
      {children ?? (
        <svg viewBox="0 0 16 16" width="100%" height="100%" fill="none">
          <path
            d="m6 4 4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </NextIcon>
  );
}
export function PaginationEllipsis({
  children,
  xstyle,
  ...props
}: ComponentProps<typeof Ellipsis>) {
  const size = useContext(Context);
  return (
    <Ellipsis aria-hidden="true" {...props} xstyle={[paginationSizes[size], xstyle]}>
      {children ?? "…"}
    </Ellipsis>
  );
}
export const Pagination = Object.assign(PaginationRoot, {
  Root: PaginationRoot,
  Summary: PaginationSummary,
  Content: PaginationContent,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  PreviousIcon: PaginationPreviousIcon,
  Next: PaginationNext,
  NextIcon: PaginationNextIcon,
  Ellipsis: PaginationEllipsis,
});
