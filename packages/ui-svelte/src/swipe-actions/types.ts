import type {
  SwipeActionsOptions,
  SwipeActionsReason,
  swipeActions,
} from "@lenso/primitives/swipe-actions/core";
import type { ChangeDetails, StateOf, SwipeSide } from "@ui-sdk/core";
import type { PartProps } from "@ui-sdk/svelte/primitive";
import type { Snippet } from "svelte";
import type { StyleXProps } from "../styled.js";

export interface SwipeAction {
  id: string;
  label: string;
  icon?: Snippet;
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
  PartProps<"div", StateOf<typeof swipeActions, "root">> &
  StyleXProps & {
    startActions?: readonly SwipeAction[];
    endActions?: readonly SwipeAction[];
    openSide?: SwipeSide | null;
    defaultOpenSide?: SwipeSide | null;
    onOpenSideChange?: (side: SwipeSide | null, details: ChangeDetails<SwipeActionsReason>) => void;
    startActionsLabel?: string;
    endActionsLabel?: string;
  };
