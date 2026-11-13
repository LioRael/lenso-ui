"use client";
import { mergeProps } from "@ui-sdk/react/primitive";
import * as Sdk from "@ui-sdk/react/listbox";
import * as stylex from "@stylexjs/stylex";
import { listBoxStyles } from "@lenso/tokens/list-box";
import { mergeStyle, type XStyle } from "../../utils/styled.js";
import { slotRender } from "../../utils/sdk-render.js";
import { ListBoxItem } from "./list-box-item.js";
import { ListBoxSection, ListBoxSectionLabel } from "./list-box-section.js";
export type ListBoxRootProps<
  T = string,
  Multiple extends boolean | undefined = false,
> = Sdk.ListboxProps<T, Multiple> & { xstyle?: XStyle; "data-lenso-slot"?: unknown };
export function ListBoxRoot<T = string, Multiple extends boolean | undefined = false>({
  xstyle,
  style,
  render,
  ...props
}: ListBoxRootProps<T, Multiple>) {
  const compiled = stylex.props(listBoxStyles.root, xstyle);
  return (
    <Sdk.Listbox<T, Multiple>
      {...(mergeProps(compiled, props) as Sdk.ListboxProps<T, Multiple>)}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", props["data-lenso-slot"] ?? "list-box", render)}
    />
  );
}
export const ListBox = Object.assign(ListBoxRoot, {
  Root: ListBoxRoot,
  Item: ListBoxItem,
  Section: ListBoxSection,
  SectionLabel: ListBoxSectionLabel,
});
export { createListboxController } from "@ui-sdk/react/listbox";
