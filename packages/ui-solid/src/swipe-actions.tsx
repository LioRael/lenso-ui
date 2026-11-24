import {
  createSwipeActionsController,
  swipeActions,
  type SwipeActionsReason,
  type SwipeActionsOptions,
} from "@lenso/primitives/swipe-actions/core";
import { swipeActionsStyles as s } from "@lenso/tokens/swipe-actions";
import type { JSX } from "@solidjs/web";
import type { ChangeDetails, SwipeSide } from "@ui-sdk/core";
import { Button } from "@ui-sdk/solid/button";
import { createParts, type PartProps } from "@ui-sdk/solid/primitive";
import { For, Show, omit } from "solid-js";
import { attributes, sdkPart, type SlotProps } from "./parts.js";

const parts = createParts(swipeActions, {
  root: "div",
  content: "div",
  body: "div",
  actions: "div",
  trigger: "button",
});
const Root = sdkPart(parts.Root, "swipe-actions", () => s.root);
const Content = sdkPart(parts.Content, "swipe-actions-content", () => s.content);
const Body = sdkPart(parts.Body, "swipe-actions-body", () => s.body);
const Actions = sdkPart(parts.Actions, "swipe-actions-actions", (props) => [
  s.actions,
  props.side === "start" ? s.start : s.end,
]);
const Trigger = sdkPart(parts.Trigger, "swipe-actions-trigger", () => s.trigger);
const Sides: readonly SwipeSide[] = ["start", "end"];

export interface SwipeAction {
  id: string;
  label: string;
  icon?: JSX.Element;
  labelPlacement?: "inline" | "below" | "hidden";
  variant?: "default" | "danger" | "tint";
  disabled?: boolean;
  fullSwipe?: boolean;
  onAction: () => void;
}
export type SwipeActionsProps = Omit<
  SwipeActionsOptions,
  "open" | "defaultOpen" | "onOpenChange" | "onFullSwipe"
> &
  PartProps<"div", ReturnType<typeof swipeActions>["types"]["state"]> &
  SlotProps & {
    startActions?: readonly SwipeAction[];
    endActions?: readonly SwipeAction[];
    openSide?: SwipeSide | null;
    defaultOpenSide?: SwipeSide | null;
    onOpenSideChange?: (side: SwipeSide | null, details: ChangeDetails<SwipeActionsReason>) => void;
    startActionsLabel?: string;
    endActionsLabel?: string;
  };

export function SwipeActions(props: SwipeActionsProps) {
  const ownController = createSwipeActionsController();
  const controller = () => props.controller ?? ownController;
  const entries = (side: SwipeSide) =>
    (side === "start" ? props.startActions : props.endActions) ?? [];
  const open = (side: SwipeSide | null | undefined) =>
    side && entries(side).length && !props.disabled ? { key: "row", side } : null;
  return (
    <Root
      {...omit(
        props,
        "startActions",
        "endActions",
        "openSide",
        "defaultOpenSide",
        "onOpenSideChange",
        "startActionsLabel",
        "endActionsLabel",
        "children",
        "controller",
      )}
      controller={controller()}
      open={props.openSide === undefined ? undefined : open(props.openSide)}
      defaultOpen={open(props.defaultOpenSide)}
      onOpenChange={(value, details) => props.onOpenSideChange?.(value?.side ?? null, details)}
      onFullSwipe={(side) => {
        const action = entries(side).find((entry) => entry.fullSwipe && !entry.disabled);
        if (!action || props.disabled) return false;
        action.onAction();
        return true;
      }}
    >
      <Content>
        <For each={Sides}>
          {(side) => (
            <Show when={entries(side).length}>
              <Actions side={side} value={side} data-swipe-actions-side={side}>
                <For each={entries(side).map(({ id }) => id)}>
                  {(id) => {
                    const action = () => entries(side).find((entry) => entry.id === id)!;
                    const placement = () =>
                      action().icon ? (action().labelPlacement ?? "inline") : "inline";
                    return (
                      <Button
                        class={attributes(s.action).class}
                        data-swipe-action=""
                        disabled={props.disabled || action().disabled}
                        aria-label={placement() === "hidden" ? action().label : undefined}
                        onClick={() => {
                          controller().setOpenSide(null);
                          action().onAction();
                        }}
                      >
                        <span
                          {...attributes(
                            s.face,
                            placement() === "below" && s.captionFace,
                            action().variant === "danger" && s.danger,
                            action().variant === "tint" && s.tint,
                          )}
                        >
                          {action().icon && (
                            <span
                              aria-hidden="true"
                              {...attributes(
                                s.actionIcon,
                                placement() === "inline" && s.inlineIcon,
                              )}
                            >
                              {action().icon}
                            </span>
                          )}
                          {placement() === "inline" && (
                            <span {...attributes(s.label)}>{action().label}</span>
                          )}
                        </span>
                        {placement() === "below" && (
                          <span data-swipe-caption="" {...attributes(s.label, s.caption)}>
                            {action().label}
                          </span>
                        )}
                      </Button>
                    );
                  }}
                </For>
              </Actions>
            </Show>
          )}
        </For>
        <Body>
          {props.children}
          <For each={Sides}>
            {(side) => (
              <Show when={entries(side).length}>
                <Trigger
                  side={side}
                  value={side}
                  aria-label={
                    side === "start"
                      ? (props.startActionsLabel ?? "Show leading actions")
                      : (props.endActionsLabel ?? "Show trailing actions")
                  }
                  data-swipe-trigger={side}
                >
                  <span aria-hidden="true" {...attributes(s.icon)}>
                    ⋯
                  </span>
                </Trigger>
              </Show>
            )}
          </For>
        </Body>
      </Content>
    </Root>
  );
}

export { createSwipeActionsController };
export type { SwipeActionsController } from "@lenso/primitives/swipe-actions/core";
