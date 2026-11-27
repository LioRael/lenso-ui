<script lang="ts">
  import { createSwipeActionsController } from "@lenso/primitives/swipe-actions/core";
  import { swipeActionsStyles as s } from "@lenso/tokens/swipe-actions";
  import type { SwipeSide } from "@ui-sdk/core";
  import { Button } from "@ui-sdk/svelte/button";
  import { attributes, styled } from "../styled.js";
  import { parts } from "./parts.js";
  import type { SwipeActionsProps } from "./types.js";

  const { Root, Content, Body, Actions, Trigger } = parts;
  let {
    startActions = [],
    endActions = [],
    openSide,
    defaultOpenSide,
    onOpenSideChange,
    startActionsLabel = "Show leading actions",
    endActionsLabel = "Show trailing actions",
    controller,
    disabled,
    children: content,
    xstyle,
    class: className,
    style,
    ...rest
  }: SwipeActionsProps = $props();

  const ownController = createSwipeActionsController();
  const activeController = $derived(controller ?? ownController);
  const sides: readonly SwipeSide[] = ["start", "end"];
  const entries = (side: SwipeSide) => (side === "start" ? startActions : endActions);
  const open = (side: SwipeSide | null | undefined) =>
    side && entries(side).length && !disabled ? { key: "row", side } : null;
  const presentation = $derived(styled(s.root, xstyle, className, style));

  function fullSwipe(side: SwipeSide) {
    const action = entries(side).find((entry) => entry.fullSwipe && !entry.disabled);
    if (!action || disabled) return false;
    action.onAction();
    return true;
  }
</script>

<Root
  data-lenso-slot="swipe-actions"
  {...rest}
  {...presentation}
  {disabled}
  controller={activeController}
  open={openSide === undefined ? undefined : open(openSide)}
  defaultOpen={open(defaultOpenSide)}
  onOpenChange={(value, details) => onOpenSideChange?.(value?.side ?? null, details)}
  onFullSwipe={fullSwipe}
>
  {#snippet children(state)}
    <Content data-lenso-slot="swipe-actions-content" {...attributes(s.content)}>
      {#each sides as side (side)}
        {#if entries(side).length}
          <Actions
            {side}
            value={side}
            data-lenso-slot="swipe-actions-actions"
            data-swipe-actions-side={side}
            {...attributes(s.actions, side === "start" ? s.start : s.end)}
          >
            {#each entries(side) as action (action.id)}
              {@const placement = action.icon ? (action.labelPlacement ?? "inline") : "inline"}
              <Button
                {...attributes(s.action)}
                data-swipe-action=""
                disabled={disabled || action.disabled}
                aria-label={placement === "hidden" ? action.label : undefined}
                onclick={() => {
                  activeController.setOpenSide(null);
                  action.onAction();
                }}
              >
                <span
                  {...attributes(
                    s.face,
                    placement === "below" && s.captionFace,
                    action.variant === "danger" && s.danger,
                    action.variant === "tint" && s.tint,
                  )}
                >
                  {#if action.icon}
                    <span
                      aria-hidden="true"
                      {...attributes(s.actionIcon, placement === "inline" && s.inlineIcon)}
                    >
                      {@render action.icon()}
                    </span>
                  {/if}
                  {#if placement === "inline"}<span {...attributes(s.label)}>
                      {action.label}
                    </span>{/if}
                </span>
                {#if placement === "below"}
                  <span data-swipe-caption="" {...attributes(s.label, s.caption)}>
                    {action.label}
                  </span>
                {/if}
              </Button>
            {/each}
          </Actions>
        {/if}
      {/each}
      <Body data-lenso-slot="swipe-actions-body" {...attributes(s.body)}>
        {@render content?.(state)}
        {#each sides as side (side)}
          {#if entries(side).length}
            <Trigger
              {side}
              value={side}
              data-lenso-slot="swipe-actions-trigger"
              data-swipe-trigger={side}
              aria-label={side === "start" ? startActionsLabel : endActionsLabel}
              {...attributes(s.trigger)}
            >
              <span aria-hidden="true" {...attributes(s.icon)}>⋯</span>
            </Trigger>
          {/if}
        {/each}
      </Body>
    </Content>
  {/snippet}
</Root>
