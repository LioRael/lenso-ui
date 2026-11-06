"use client";
import type { ComponentProps } from "react";
import { DateField, DateInputGroup } from "@lenso/ui";
export interface DateInputGroupStoryProps extends Pick<
  ComponentProps<typeof DateInputGroup>,
  "variant" | "fullWidth"
> {}
export const initialArgs: DateInputGroupStoryProps = /* story-args:start */ {
  variant: "primary",
  fullWidth: false,
}; /* story-args:end */

export function Preview(overrides: DateInputGroupStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <DateField>
      <DateField.Label>Event date</DateField.Label>
      <DateField.Group {...args}>
        <DateField.Input>{(segment) => <DateField.Segment segment={segment} />}</DateField.Input>
      </DateField.Group>
    </DateField>
  );
}
