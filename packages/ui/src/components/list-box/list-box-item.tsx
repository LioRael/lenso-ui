"use client";
import * as React from "react";
import * as Sdk from "@ui-sdk/react/listbox";
import * as stylex from "@stylexjs/stylex";
import { listBoxItemStyles } from "@lenso/tokens/list-box";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { slotRender } from "../../utils/sdk-render.js";
export type ListBoxItemRootProps<T = string> = StyleXProps<
  React.ComponentProps<typeof Sdk.ListboxItem<T>>
> & { variant?: "default" | "danger" };
export function ListBoxItemRoot<T = string>({
  variant = "default",
  xstyle,
  style,
  render,
  ...props
}: ListBoxItemRootProps<T>) {
  const compiled = stylex.props(
    listBoxItemStyles.root,
    variant === "danger" && listBoxItemStyles.danger,
    props.disabled && listBoxItemStyles.disabled,
    xstyle,
  );
  return (
    <Sdk.ListboxItem<T>
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "list-box-item", render)}
    />
  );
}
export function ListBoxItemIndicator({
  children,
  xstyle,
  style,
  render,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ListboxItemIndicator>>) {
  const compiled = stylex.props(listBoxItemStyles.indicator, xstyle);
  return (
    <Sdk.ListboxItemIndicator
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("span", props["data-lenso-slot"] ?? "list-box-item-indicator", render)}
    >
      {children ?? (
        <svg
          {...stylex.props(listBoxItemStyles.checkmark)}
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          viewBox="0 0 17 18"
        >
          <polyline points="1 9 7 14 15 4" />
        </svg>
      )}
    </Sdk.ListboxItemIndicator>
  );
}
export const ListBoxItem = Object.assign(ListBoxItemRoot, {
  Root: ListBoxItemRoot,
  Indicator: ListBoxItemIndicator,
});
