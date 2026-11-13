"use client";
import * as React from "react";
import * as Sdk from "@ui-sdk/react/listbox";
import { listBoxSectionStyles, listBoxSectionLabelStyles } from "@lenso/tokens/list-box";
import * as stylex from "@stylexjs/stylex";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import { slotRender } from "../../utils/sdk-render.js";
export function ListBoxSectionRoot({
  xstyle,
  style,
  render,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ListboxGroup>>) {
  const compiled = stylex.props(listBoxSectionStyles.root, xstyle);
  return (
    <Sdk.ListboxGroup
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "list-box-section", render)}
    />
  );
}
export const ListBoxSection = Object.assign(ListBoxSectionRoot, { Root: ListBoxSectionRoot });
export function ListBoxSectionLabel({
  xstyle,
  style,
  render,
  ...props
}: StyleXProps<React.ComponentProps<typeof Sdk.ListboxGroupLabel>>) {
  const compiled = stylex.props(listBoxSectionLabelStyles.root, xstyle);
  return (
    <Sdk.ListboxGroupLabel
      {...props}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "list-box-section-label", render)}
    />
  );
}
