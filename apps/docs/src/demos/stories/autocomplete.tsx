"use client";
import type { ComponentProps } from "react";
import { TextSuggestions } from "../en/autocomplete/text-suggestions";
import { states } from "../en/autocomplete/default";
export interface AutocompleteStoryProps extends Pick<
  ComponentProps<typeof TextSuggestions>,
  "label" | "placeholder" | "disabled" | "required" | "variant"
> {}
export const initialArgs: AutocompleteStoryProps = /* story-args:start */ {
  label: "State to visit",
  placeholder: "Enter any state",
  disabled: false,
  required: false,
  variant: "primary",
}; /* story-args:end */

export function Preview(overrides: AutocompleteStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <TextSuggestions options={states.map((item) => item.name)} {...args} />;
}
