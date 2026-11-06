"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface LinkStoryProps extends Pick<StoryComponentProps<typeof Link>, "disabled"> {}
export const initialArgs: LinkStoryProps = /* story-args:start */ {
  disabled: false,
}; /* story-args:end */

import { Link } from "@lenso/ui";

export function LinkBasic(overrides: LinkStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Link href="#" {...args}>
      Call to action <Link.Icon aria-hidden="true" />
    </Link>
  );
}
