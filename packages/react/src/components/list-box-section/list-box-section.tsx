"use client";
// HeroUI v3.2.6 anatomy/styles adaptation, Apache-2.0.
import { listBoxSectionStyles } from "@lenso/tokens/list-box-section";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export function ListBoxSectionRoot({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<"div">>) {
  const compiled = stylex.props(listBoxSectionStyles.root, xstyle);
  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA option groups belong inside a custom listbox; optgroup requires select, while fieldset incorrectly introduces form grouping.
      role="group"
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "list-box-section"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const ListBoxSection = Object.assign(ListBoxSectionRoot, { Root: ListBoxSectionRoot });
