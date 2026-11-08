"use client";
import type { ComponentProps } from "react";
import { SelectExample, states } from "../en/select/select-example";
export interface SelectStoryProps extends Pick<
  ComponentProps<typeof SelectExample>,
  "label" | "placeholder" | "disabled" | "required" | "variant" | "alignItemWithTrigger"
> {}
export const initialArgs: SelectStoryProps = /* story-args:start */ {
  label: "State",
  placeholder: "Choose a state",
  disabled: false,
  required: false,
  variant: "primary",
  alignItemWithTrigger: true,
}; /* story-args:end */

export function Preview(overrides: SelectStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <SelectExample choices={states} defaultValue="california" {...args} />;
}
