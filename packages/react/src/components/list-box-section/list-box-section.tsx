"use client";
// HeroUI v3.2.6 anatomy/styles adaptation, Apache-2.0.
import { listBoxSectionStyles } from "@lenso/tokens/list-box-section";
import { styledPart } from "../../utils/styled.js";
const Part = styledPart("div", "list-box-section", listBoxSectionStyles.root);
export const ListBoxSectionRoot = (props: React.ComponentProps<typeof Part>) => (
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA option groups belong inside a custom listbox; optgroup requires select, while fieldset incorrectly introduces form grouping.
  <Part role="group" {...props} />
);
export const ListBoxSection = Object.assign(ListBoxSectionRoot, { Root: ListBoxSectionRoot });
