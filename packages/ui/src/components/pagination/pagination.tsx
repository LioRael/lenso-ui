"use client";

import { createContext, useContext, type ComponentProps } from "react";
import { paginationStyles, paginationSizes, paginationPress } from "@lenso/tokens/pagination";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { LinkRoot, type LinkRootProps } from "../link/link.js";
import type { ButtonSize } from "../button/button.js";
const Context = createContext<ButtonSize>("md");
function Summary({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(paginationStyles.summary, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "pagination-summary"}
    />
  );
}
export function PaginationContent({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"ul">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(paginationStyles.content, xstyle);
  return (
    <ul
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "pagination-content"}
    />
  );
}
export function PaginationItem({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"li">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(paginationStyles.item, xstyle);
  return (
    <li
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "pagination-item"}
    />
  );
}
function Ellipsis({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(paginationStyles.ellipsis, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "pagination-ellipsis"}
    />
  );
}
function PreviousIcon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(paginationStyles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "pagination-previous-icon"}
    />
  );
}
function NextIcon({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(paginationStyles.icon, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "pagination-next-icon"}
    />
  );
}
export type PaginationRootProps = StyleXProps<React.ComponentPropsWithRef<"nav">> & {
  "data-slot"?: unknown;
  size?: ButtonSize;
};
export function PaginationRoot({ size = "md", xstyle, style, ...props }: PaginationRootProps) {
  const compiled = stylex.props(paginationStyles.root, xstyle);
  return (
    <Context value={size}>
      <nav
        aria-label="Pagination"
        {...props}
        {...compiled}
        style={mergeStyle(compiled.style, style)}
        data-slot={props["data-slot"] ?? "pagination"}
      />
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
