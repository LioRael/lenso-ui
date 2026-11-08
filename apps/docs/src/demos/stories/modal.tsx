"use client";
import type { ComponentProps as StoryComponentProps } from "react";
import type { Modal } from "@lenso/ui";
export interface ModalStoryProps extends Pick<StoryComponentProps<typeof Modal>, "defaultOpen"> {}
export const initialArgs: ModalStoryProps = /* story-args:start */ {
  defaultOpen: false,
}; /* story-args:end */

import { ProfileDialog } from "../shared/presentation-panels";

export function Default(overrides: ModalStoryProps) {
  return <ProfileDialog {...initialArgs} {...overrides} />;
}
