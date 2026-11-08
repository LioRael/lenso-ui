"use client";
import { listBoxSectionStyles, listBoxSectionLabelStyles } from "@lenso/tokens/list-box";
import { createContext, useContext, useId } from "react";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
const SectionContext = createContext<string | undefined>(undefined);
export function ListBoxSectionRoot({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentProps<"div">>) {
  const labelId = useId();
  const compiled = stylex.props(listBoxSectionStyles.root, xstyle);
  return (
    <SectionContext value={labelId}>
      <div
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA option groups belong inside a custom listbox; optgroup requires select, while fieldset incorrectly introduces form grouping.
        role="group"
        aria-labelledby={props["aria-label"] ? undefined : labelId}
        {...props}
        data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "list-box-section"}
        {...compiled}
        style={{ ...compiled.style, ...style }}
      />
    </SectionContext>
  );
}
export const ListBoxSection = Object.assign(ListBoxSectionRoot, { Root: ListBoxSectionRoot });

export function ListBoxSectionLabel({
  xstyle,
  style,
  ...props
}: StyleXProps<React.ComponentPropsWithRef<"div">>) {
  const id = useContext(SectionContext);
  const compiled = stylex.props(listBoxSectionLabelStyles.root, xstyle);
  return (
    <div
      {...props}
      id={id}
      {...compiled}
      style={{ ...compiled.style, ...style }}
      data-slot="list-box-section-label"
    />
  );
}
