"use client";
import type { ComponentProps } from "react";
import { Input } from "@lenso/ui";
import { GroupedForm } from "../shared/grouped-form";
export interface FormStoryProps extends Pick<
  ComponentProps<typeof Input>,
  "required" | "disabled" | "placeholder"
> {
  label: string;
}
export const initialArgs: FormStoryProps = /* story-args:start */ {
  label: "Email",
  required: true,
  disabled: false,
  placeholder: "you@example.com",
}; /* story-args:end */

export function Preview(overrides: FormStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <GroupedForm {...args} />;
}
