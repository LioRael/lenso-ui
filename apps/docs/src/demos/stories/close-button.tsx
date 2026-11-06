"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface CloseButtonStoryProps extends Pick<
  StoryComponentProps<typeof CloseButton>,
  "disabled" | "isLoading"
> {}
export const initialArgs: CloseButtonStoryProps = /* story-args:start */ {
  disabled: false,
  isLoading: false,
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { CloseButton } from "@lenso/ui";
export function Default(overrides: CloseButtonStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <CloseButton {...args} />;
}
