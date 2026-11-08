"use client";
import type { ComponentProps as StoryComponentProps } from "react";
import type { Drawer } from "@lenso/ui";
export interface DrawerStoryProps extends Pick<StoryComponentProps<typeof Drawer>, "defaultOpen"> {}
export const initialArgs: DrawerStoryProps = /* story-args:start */ {
  defaultOpen: false,
}; /* story-args:end */

import { ReadingDrawer } from "../shared/presentation-panels";

export function Basic(overrides: DrawerStoryProps) {
  return <ReadingDrawer {...initialArgs} {...overrides} />;
}
