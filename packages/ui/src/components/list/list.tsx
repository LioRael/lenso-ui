"use client";
import type { ComponentProps } from "react";
import { listStyles } from "@lenso/tokens/list";
import { groupStyles } from "@lenso/tokens/surface";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type ListRootProps = StyleXProps<ComponentProps<"ul">>;
export function ListRoot({ xstyle, style, ...props }: ListRootProps) {
  const compiled = stylex.props(groupStyles.surface, listStyles.root, xstyle);
  return (
    <ul {...props} {...compiled} style={{ ...compiled.style, ...style }} data-slot="list-root" />
  );
}
export type ListContentProps = StyleXProps<ComponentProps<"div">>;
export function ListContent({ xstyle, style, ...props }: ListContentProps) {
  const compiled = stylex.props(listStyles.content, xstyle);
  return (
    <div
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="list-content"
    />
  );
}
export type ListTitleProps = StyleXProps<ComponentProps<"span">>;
export function ListTitle({ xstyle, style, ...props }: ListTitleProps) {
  const compiled = stylex.props(listStyles.title, xstyle);
  return (
    <span {...props} {...compiled} style={{ ...compiled.style, ...style }} data-slot="list-title" />
  );
}
export type ListDescriptionProps = StyleXProps<ComponentProps<"span">>;
export function ListDescription({ xstyle, style, ...props }: ListDescriptionProps) {
  const compiled = stylex.props(listStyles.description, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="list-description"
    />
  );
}
export type ListLeadingProps = StyleXProps<ComponentProps<"span">>;
export function ListLeading({ xstyle, style, ...props }: ListLeadingProps) {
  const compiled = stylex.props(listStyles.leading, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="list-leading"
    />
  );
}
export type ListTrailingProps = StyleXProps<ComponentProps<"span">>;
export function ListTrailing({ xstyle, style, ...props }: ListTrailingProps) {
  const compiled = stylex.props(listStyles.trailing, xstyle);
  return (
    <span
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="list-trailing"
    />
  );
}
export type ListSeparatorProps = StyleXProps<ComponentProps<"li">>;
export function ListSeparator({ xstyle, style, ...props }: ListSeparatorProps) {
  const compiled = stylex.props(groupStyles.separator, listStyles.separator, xstyle);
  return (
    <li
      role="presentation"
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="list-separator"
    />
  );
}
export type ListActionProps = StyleXProps<ComponentProps<"button">>;
export function ListAction({ xstyle, style, ...props }: ListActionProps) {
  const compiled = stylex.props(listStyles.action, xstyle);
  return (
    <button
      type="button"
      {...props}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="list-action"
    />
  );
}
export type ListItemProps = StyleXProps<ComponentProps<"li">> & { height?: "regular" | "tall" };
export function ListItem({ height = "regular", xstyle, style, ...props }: ListItemProps) {
  const compiled = stylex.props(
    groupStyles.row,
    listStyles.item,
    height === "tall" && listStyles.tall,
    xstyle,
  );
  return (
    <li {...props} {...compiled} style={{ ...compiled.style, ...style }} data-slot="list-item" />
  );
}
export const List = Object.assign(ListRoot, {
  Root: ListRoot,
  Item: ListItem,
  Content: ListContent,
  Title: ListTitle,
  Description: ListDescription,
  Leading: ListLeading,
  Trailing: ListTrailing,
  Separator: ListSeparator,
  Action: ListAction,
});
export type ListProps = ListRootProps;
