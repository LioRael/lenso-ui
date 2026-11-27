import { swipeActions } from "@lenso/primitives/swipe-actions/core";
import { createParts, type Parts } from "@ui-sdk/svelte/primitive";

const slots = {
  root: "div",
  content: "div",
  body: "div",
  actions: "div",
  trigger: "button",
} as const;

export const parts: Parts<typeof swipeActions, typeof slots> = createParts(swipeActions, slots);
