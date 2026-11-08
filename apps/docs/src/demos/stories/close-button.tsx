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

import { CloseButton } from "@lenso/ui";
export function Default(overrides: CloseButtonStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return <CloseButton {...args} />;
}
