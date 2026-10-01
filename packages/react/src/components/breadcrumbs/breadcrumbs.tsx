"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ComponentProps,
  type ReactNode,
} from "react";
import { breadcrumbsStyles } from "@lenso/tokens/breadcrumbs";
import { useRender } from "@base-ui/react/use-render";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import type * as React from "react";
import * as stylex from "@stylexjs/stylex";
import { LinkRoot, type LinkRootProps } from "../link/link.js";
function Nav({
  xstyle,
  style,
  render,
  ref,
  ...props
}: StyleXProps<useRender.ComponentProps<"nav">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(xstyle);
  return useRender({
    defaultTagName: "nav",
    render,
    ref,
    props: {
      ...props,
      ...compiled,
      style: mergeStyle(compiled.style, style),
      "data-slot": props["data-slot"] ?? "breadcrumbs-nav",
    },
  });
}
function List({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"ol">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(breadcrumbsStyles.root, xstyle);
  return (
    <ol
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "breadcrumbs"}
    />
  );
}
function Item({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"li">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(breadcrumbsStyles.item, xstyle);
  return (
    <li
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "breadcrumbs-item"}
    />
  );
}
function Separator({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"span">> & { "data-slot"?: unknown }) {
  const compiled = stylex.props(breadcrumbsStyles.separator, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      data-slot={props["data-slot"] ?? "breadcrumbs-separator"}
    />
  );
}
const Context = createContext<ReactNode>(undefined);
const DisabledContext = createContext(false);
export type BreadcrumbsRootProps = ComponentProps<typeof Nav> & {
  separator?: ReactNode;
  disabled?: boolean;
};
export function BreadcrumbsRoot({
  children,
  separator,
  disabled = false,
  ...props
}: BreadcrumbsRootProps) {
  const items = Children.toArray(children);
  const last = items.reduce(
    (previous, child, index) =>
      isValidElement(child) && child.type === BreadcrumbsItem ? index : previous,
    -1,
  );
  return (
    <Context value={separator}>
      <DisabledContext value={disabled}>
        <Nav aria-label="Breadcrumb" {...props}>
          <List>
            {items.map((child, index) =>
              isValidElement<BreadcrumbsItemProps>(child) && child.type === BreadcrumbsItem
                ? cloneElement(child, { isCurrent: child.props.isCurrent ?? index === last })
                : child,
            )}
          </List>
        </Nav>
      </DisabledContext>
    </Context>
  );
}
export type BreadcrumbsItemProps = LinkRootProps & { isCurrent?: boolean };
export function BreadcrumbsItem({
  isCurrent = false,
  disabled,
  xstyle,
  ...props
}: BreadcrumbsItemProps) {
  const separator = useContext(Context);
  const groupDisabled = useContext(DisabledContext);
  return (
    <Item>
      <LinkRoot
        {...props}
        disabled={disabled ?? groupDisabled}
        aria-current={isCurrent ? "page" : undefined}
        data-current={isCurrent || undefined}
        xstyle={[breadcrumbsStyles.link, isCurrent && breadcrumbsStyles.current, xstyle]}
      />
      {!isCurrent && (
        <Separator aria-hidden="true" xstyle={breadcrumbsStyles.lastSeparator}>
          {separator ?? (
            <svg viewBox="0 0 12 12" width="100%" height="100%" fill="none">
              <path
                d="m4.5 3 3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </Separator>
      )}
    </Item>
  );
}
export const Breadcrumbs = Object.assign(BreadcrumbsRoot, {
  Root: BreadcrumbsRoot,
  Item: BreadcrumbsItem,
});
