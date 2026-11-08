"use client";
import type { ComponentProps } from "react";
import { AnimalPicker } from "../en/combo-box/shared";
export interface ComboBoxStoryProps extends Pick<
  ComponentProps<typeof AnimalPicker>,
  "label" | "placeholder" | "disabled" | "readOnly" | "required" | "variant"
> {}
export const initialArgs: ComboBoxStoryProps = /* story-args:start */ {
  label: "Favorite animal",
  placeholder: "Search animals",
  disabled: false,
  readOnly: false,
  required: false,
  variant: "primary",
}; /* story-args:end */

export function Preview(overrides: ComboBoxStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <AnimalPicker {...args} />;
}
