"use client";
import { Description } from "@lenso/ui";
export interface DescriptionStoryProps {
  label: string;
}
export const initialArgs: DescriptionStoryProps = /* story-args:start */ {
  label: "Additional information",
}; /* story-args:end */

export function Preview(overrides: DescriptionStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <Description>{args.label}</Description>;
}
