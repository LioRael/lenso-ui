"use client";
import { createParts, type Parts } from "@ui-sdk/react/primitive";
import { swipeActions } from "./swipe-actions.js";
const tags = {
  root: "div",
  content: "div",
  body: "div",
  actions: "div",
  trigger: "button",
} as const;
export const SwipeActions: Parts<typeof swipeActions, typeof tags> = createParts(
  swipeActions,
  tags,
);
export { swipeActions, createSwipeActionsController } from "./swipe-actions.js";
export type {
  SwipeActionsOptions,
  SwipeActionsController,
  SwipeActionsReason,
} from "./swipe-actions.js";
