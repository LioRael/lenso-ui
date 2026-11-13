"use client";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  SwipeActions as Primitive,
  createSwipeActionsController,
  type SwipeActionsOptions,
} from "@lenso/primitives/swipe-actions";
import { NativeButton } from "../../utils/native-button.js";
import { slotRender } from "../../utils/sdk-render.js";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
import * as stylex from "@stylexjs/stylex";
import { swipeActionsStyles as s } from "@lenso/tokens/swipe-actions";
import type { ChangeDetails, SwipeSide } from "@ui-sdk/core";
import type { SwipeActionsReason } from "@lenso/primitives/swipe-actions";
export type SwipeActionsSide = SwipeSide;
export { createSwipeActionsController } from "@lenso/primitives/swipe-actions";
export type { SwipeActionsController } from "@lenso/primitives/swipe-actions";
export interface SwipeAction {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "danger" | "tint";
  disabled?: boolean;
  fullSwipe?: boolean;
  onAction: () => void;
}
export type SwipeActionsProps = Omit<
  StyleXProps<ComponentProps<typeof Primitive.Root>>,
  "open" | "defaultOpen" | "onOpenChange" | "onFullSwipe"
> & {
  startActions?: readonly SwipeAction[];
  endActions?: readonly SwipeAction[];
  openSide?: SwipeSide | null;
  defaultOpenSide?: SwipeSide | null;
  onOpenSideChange?: (side: SwipeSide | null, details: ChangeDetails<SwipeActionsReason>) => void;
  startActionsLabel?: string;
  endActionsLabel?: string;
};
export function SwipeActions({
  startActions = [],
  endActions = [],
  openSide,
  defaultOpenSide = null,
  onOpenSideChange,
  startActionsLabel = "Show leading actions",
  endActionsLabel = "Show trailing actions",
  disabled = false,
  controller: providedController,
  children,
  xstyle,
  style,
  render,
  ...props
}: SwipeActionsProps) {
  const [ownController] = useState(createSwipeActionsController);
  const controller = providedController ?? ownController;
  const compiled = stylex.props(s.root, xstyle);
  const entries = (side: SwipeSide) => (side === "start" ? startActions : endActions);
  const open = (side: SwipeSide | null) =>
    side && entries(side).length && !disabled ? { key: "row", side } : null;
  const trigger = (side: SwipeSide) =>
    entries(side).length ? (
      <Primitive.Trigger
        value={side}
        side={side}
        aria-label={side === "start" ? startActionsLabel : endActionsLabel}
        data-swipe-trigger={side}
        {...stylex.props(s.trigger)}
      >
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" {...stylex.props(s.icon)}>
          <circle cx="4" cy="10" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="16" cy="10" r="1.5" />
        </svg>
      </Primitive.Trigger>
    ) : null;
  const actions = (side: SwipeSide) =>
    entries(side).length ? (
      <Primitive.Actions
        value={side}
        side={side}
        data-swipe-actions-side={side}
        {...stylex.props(s.actions, side === "start" ? s.start : s.end)}
      >
        {entries(side).map((action) => (
          <NativeButton
            key={action.id}
            disabled={disabled || action.disabled}
            data-swipe-action=""
            {...stylex.props(
              s.action,
              action.variant === "danger" && s.danger,
              action.variant === "tint" && s.tint,
            )}
            onClick={() => {
              controller.setOpenSide(null);
              return action.onAction();
            }}
          >
            {action.icon && <span aria-hidden="true">{action.icon}</span>}
            {action.label}
          </NativeButton>
        ))}
      </Primitive.Actions>
    ) : null;
  const onFullSwipe: SwipeActionsOptions["onFullSwipe"] = (side) => {
    const action = entries(side).find((action) => action.fullSwipe && !action.disabled);
    if (!action) return false;
    controller.setOpenSide(null);
    action.onAction();
    return true;
  };
  return (
    <Primitive.Root
      aria-label={endActions.length ? endActionsLabel : startActionsLabel}
      {...props}
      controller={controller}
      disabled={disabled}
      open={openSide === undefined ? undefined : open(openSide)}
      defaultOpen={open(defaultOpenSide)}
      onOpenChange={(next, details) => onOpenSideChange?.(next?.side ?? null, details)}
      onFullSwipe={
        [...startActions, ...endActions].some((action) => action.fullSwipe && !action.disabled)
          ? onFullSwipe
          : undefined
      }
      {...compiled}
      style={mergeStyle(compiled.style, style)}
      render={slotRender("div", "swipe-actions", render)}
    >
      {(state) => (
        <>
          <Primitive.Content {...stylex.props(s.content)} data-lenso-slot="swipe-actions-content">
            {trigger("start")}
            <Primitive.Body data-lenso-slot="swipe-actions-body" {...stylex.props(s.body)}>
              {typeof children === "function" ? children(state) : children}
            </Primitive.Body>
            {trigger("end")}
          </Primitive.Content>
          {actions("start")}
          {actions("end")}
        </>
      )}
    </Primitive.Root>
  );
}
