import {
  createSwipeActionsController,
  swipeActions,
  type SwipeActionsReason,
} from "@lenso/primitives/swipe-actions/core";
import { swipeActionsStyles as s } from "@lenso/tokens/swipe-actions";
import * as stylex from "@stylexjs/stylex";
import type { ChangeDetails, SwipeSide } from "@ui-sdk/core";
import { Button } from "@ui-sdk/vue/button";
import { createParts } from "@ui-sdk/vue/primitive";
import { defineComponent, h, type PropType, type VNodeChild } from "vue";
import { sdkPart, type ComponentProps, type StyledPart } from "./parts.js";

const tags = {
  root: "div",
  content: "div",
  body: "div",
  actions: "div",
  trigger: "button",
} as const;
const parts: ReturnType<typeof createParts<typeof swipeActions, typeof tags>> = createParts(
  swipeActions,
  tags,
);
const Root: StyledPart<typeof parts.Root> = sdkPart(parts.Root, "swipe-actions", () => s.root);
const Content: StyledPart<typeof parts.Content> = sdkPart(
  parts.Content,
  "swipe-actions-content",
  () => s.content,
);
const Body: StyledPart<typeof parts.Body> = sdkPart(parts.Body, "swipe-actions-body", () => s.body);
const Actions: StyledPart<typeof parts.Actions> = sdkPart(
  parts.Actions,
  "swipe-actions-actions",
  (props) => [s.actions, props.side === "start" ? s.start : s.end],
);
const Trigger: StyledPart<typeof parts.Trigger> = sdkPart(
  parts.Trigger,
  "swipe-actions-trigger",
  () => s.trigger,
);
const sides = ["start", "end"] as const;

export interface SwipeAction {
  id: string;
  label: string;
  icon?: VNodeChild | (() => VNodeChild);
  labelPlacement?: "inline" | "below" | "hidden";
  variant?: "default" | "danger" | "tint";
  disabled?: boolean;
  fullSwipe?: boolean;
  onAction: () => void;
}
type OpenChange = (side: SwipeSide | null, details: ChangeDetails<SwipeActionsReason>) => void;
export type SwipeActionsProps = Omit<
  ComponentProps<typeof Root>,
  "open" | "defaultOpen" | "onOpenChange" | "onFullSwipe" | "modelValue" | "onUpdate:modelValue"
> & {
  startActions?: readonly SwipeAction[];
  endActions?: readonly SwipeAction[];
  openSide?: SwipeSide | null;
  defaultOpenSide?: SwipeSide | null;
  onOpenSideChange?: OpenChange;
  "onUpdate:openSide"?: (side: SwipeSide | null) => void;
  startActionsLabel?: string;
  endActionsLabel?: string;
};

export const SwipeActions = defineComponent({
  name: "LensoSwipeActions",
  inheritAttrs: false,
  props: {
    startActions: Array as PropType<readonly SwipeAction[]>,
    endActions: Array as PropType<readonly SwipeAction[]>,
    openSide: String as PropType<SwipeSide | null>,
    defaultOpenSide: String as PropType<SwipeSide | null>,
    onOpenSideChange: Function as PropType<OpenChange>,
    startActionsLabel: String,
    endActionsLabel: String,
    disabled: Boolean,
    controller: Object as PropType<ReturnType<typeof createSwipeActionsController>>,
  },
  emits: { "update:openSide": (_value: SwipeSide | null) => true },
  setup(props, { attrs, slots, emit }) {
    const own = createSwipeActionsController();
    const controller = () => props.controller ?? own;
    const entries = (side: SwipeSide) =>
      (side === "start" ? props.startActions : props.endActions) ?? [];
    const open = (side: SwipeSide | null | undefined) =>
      side && entries(side).length && !props.disabled ? { key: "row", side } : null;

    function actionButton(action: SwipeAction) {
      const placement = action.icon ? (action.labelPlacement ?? "inline") : "inline";
      return h(
        Button,
        {
          key: action.id,
          ...stylex.attrs(s.action),
          "data-swipe-action": "",
          disabled: props.disabled || action.disabled,
          "aria-label": placement === "hidden" ? action.label : undefined,
          onClick: () => {
            controller().setOpenSide(null);
            action.onAction();
          },
        },
        {
          default: () => [
            h(
              "span",
              stylex.attrs(
                s.face,
                placement === "below" && s.captionFace,
                action.variant === "danger" && s.danger,
                action.variant === "tint" && s.tint,
              ),
              [
                action.icon &&
                  h(
                    "span",
                    {
                      ...stylex.attrs(s.actionIcon, placement === "inline" && s.inlineIcon),
                      "aria-hidden": "true",
                    },
                    [typeof action.icon === "function" ? action.icon() : action.icon],
                  ),
                placement === "inline" && h("span", stylex.attrs(s.label), action.label),
              ],
            ),
            placement === "below" &&
              h(
                "span",
                {
                  ...stylex.attrs(s.label, s.caption),
                  "data-swipe-caption": "",
                },
                action.label,
              ),
          ],
        },
      );
    }

    return () =>
      h(
        Root,
        {
          ...attrs,
          controller: controller(),
          disabled: props.disabled,
          open: props.openSide === undefined ? undefined : open(props.openSide),
          defaultOpen: open(props.defaultOpenSide),
          onOpenChange: (value, details) => {
            const side = value?.side ?? null;
            props.onOpenSideChange?.(side, details);
            if (!details.canceled) emit("update:openSide", side);
          },
          onFullSwipe: (side) => {
            const action = entries(side).find((item) => item.fullSwipe && !item.disabled);
            if (!action || props.disabled) return false;
            action.onAction();
            return true;
          },
        },
        {
          ...slots,
          default: (scope: Record<string, unknown>) =>
            h(Content, null, {
              default: () => [
                ...sides
                  .filter((side) => entries(side).length)
                  .map((side) =>
                    h(
                      Actions,
                      { key: side, side, value: side, "data-swipe-actions-side": side },
                      {
                        default: () => entries(side).map(actionButton),
                      },
                    ),
                  ),
                h(Body, null, {
                  default: () => [
                    slots["default"]?.(scope),
                    ...sides
                      .filter((side) => entries(side).length)
                      .map((side) =>
                        h(
                          Trigger,
                          {
                            key: side,
                            side,
                            value: side,
                            "data-swipe-trigger": side,
                            "aria-label":
                              side === "start"
                                ? (props.startActionsLabel ?? "Show leading actions")
                                : (props.endActionsLabel ?? "Show trailing actions"),
                          },
                          {
                            default: () =>
                              h("span", { ...stylex.attrs(s.icon), "aria-hidden": "true" }, "⋯"),
                          },
                        ),
                      ),
                  ],
                }),
              ],
            }),
        },
      );
  },
}) as unknown as new () => Omit<InstanceType<typeof Root>, "$props"> & {
  $props: SwipeActionsProps;
};

export { createSwipeActionsController };
export type { SwipeActionsController } from "@lenso/primitives/swipe-actions/core";
