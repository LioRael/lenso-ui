"use client";
import type { ComponentProps } from "react";
import { NativeAutocomplete } from "../en/autocomplete/_native";
import { states } from "../en/autocomplete/default";
export interface AutocompleteStoryProps extends Pick<
  ComponentProps<typeof NativeAutocomplete>,
  "label" | "placeholder" | "disabled" | "required" | "multiple" | "chips" | "variant"
> {}
export const initialArgs: AutocompleteStoryProps = /* story-args:start */ {
  label: "States to visit",
  placeholder: "Select states",
  disabled: false,
  required: false,
  multiple: false,
  chips: false,
  variant: "primary",
}; /* story-args:end */

export function Preview(overrides: AutocompleteStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <NativeAutocomplete items={states} {...args} />;
}
