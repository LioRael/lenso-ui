<script module lang="ts">
  export type TagState = { allowsRemoving: boolean; isSelected: boolean; isDisabled: boolean };
  export type TagRootProps = Omit<
    SvelteHTMLElements["li"],
    "size" | "variant" | "selected" | "disabled" | "children"
  > &
    StyleXProps & {
      size?: TagGroupSize;
      variant?: TagGroupVariant;
      selected?: boolean;
      disabled?: boolean;
      itemKey?: TableKey;
      textValue?: string;
      children?: Snippet<[TagState]>;
      remove?: Snippet;
    };
</script>

<script lang="ts">
  import type { TableKey } from "@lenso/primitives/table/core";
  import { materialStyles } from "@lenso/tokens/materials";
  import { tagStyles } from "@lenso/tokens/tag";
  import type { Snippet } from "svelte";
  import type { SvelteHTMLElements } from "svelte/elements";
  import MaterialBackground from "../glass/material-background.svelte";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import {
    getTagGroup,
    setTag,
    tagId,
    type TagGroupSize,
    type TagGroupVariant,
  } from "../tag-group/context.js";
  import TagRemoveButton from "./tag-remove-button.svelte";

  let {
    itemKey,
    textValue,
    size,
    variant,
    selected,
    disabled,
    xstyle,
    class: className,
    style,
    children,
    remove,
    onclick,
    onkeydown,
    ...rest
  }: TagRootProps = $props();
  const group = getTagGroup();
  let node: HTMLLIElement | undefined = $state();
  const managed = $derived(group && itemKey !== undefined);
  const isDisabled = $derived(
    Boolean(disabled || group?.disabled() || (itemKey !== undefined && group?.isDisabled(itemKey))),
  );
  const isSelected = $derived(
    selected ?? Boolean(itemKey !== undefined && group?.isSelected(itemKey)),
  );
  const allowsRemoving = $derived(Boolean(managed && group?.removable()));
  const label = $derived(textValue ?? (itemKey === undefined ? "" : String(itemKey)));
  const isRemoved = $derived(itemKey !== undefined && group?.isRemoved(itemKey));
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        tagStyles.root,
        tagStyles[size ?? group?.size() ?? "md"],
        tagStyles[variant ?? group?.variant() ?? "default"],
        isSelected && tagStyles.selected,
        isDisabled && tagStyles.disabled,
      ],
      xstyle,
      className,
      style,
    ),
  );

  setTag({
    label: () => label,
    disabled: () => isDisabled,
    remove() {
      if (itemKey !== undefined) group?.remove(itemKey);
    },
  });
  $effect(() => {
    if (node && group && itemKey !== undefined && !isRemoved) {
      return group.register(itemKey, node, isDisabled);
    }
  });
  const tabindex = $derived.by(() => {
    if (!group || itemKey === undefined) return rest.tabindex;
    if (isDisabled) return -1;
    const id = tagId(itemKey);
    return Number(
      group.handle.api.roving.tabIndex(group.state(), { key: id, props: { value: id } }),
    );
  });
</script>

{#if !isRemoved}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (Managed tags are focusable rows in a roving grid.) -->
  <li
    data-lenso-slot="tag"
    {...rest}
    {...presentation}
    bind:this={node}
    {tabindex}
    role={managed ? "row" : rest.role}
    aria-label={rest["aria-label"] ?? (managed ? label : undefined)}
    aria-disabled={isDisabled || undefined}
    aria-selected={managed && group?.mode() !== "none" ? isSelected : undefined}
    data-selected={isSelected ? "" : undefined}
    data-collection-item={managed ? "tag" : undefined}
    data-material="glass-small"
    onclick={(event) => {
      onclick?.(event);
      if (
        !event.defaultPrevented &&
        managed &&
        !isDisabled &&
        itemKey !== undefined &&
        !(event.target instanceof Element && event.target.closest("button,a,input,select,textarea"))
      ) {
        event.currentTarget.focus();
        group?.select(itemKey, event);
      }
    }}
    onkeydown={(event) => {
      onkeydown?.(event);
      if (
        event.defaultPrevented ||
        isDisabled ||
        !group ||
        itemKey === undefined ||
        event.target !== event.currentTarget
      )
        return;
      if (allowsRemoving && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        group.remove(itemKey);
      } else if (event.key === " " || event.key === "Enter") {
        if (group.mode() !== "none") {
          event.preventDefault();
          group.select(itemKey, event);
        }
      } else {
        const move = group.handle.api.roving.keydown(event, event.currentTarget);
        if (move?.shift && group.mode() === "multiple") {
          group.extend(move.key, event, move.from);
        }
      }
    }}
  >
    <MaterialBackground />
    <span
      role={managed ? "gridcell" : undefined}
      data-lenso-slot="tag-cell"
      {...attributes(tagStyles.cell)}
    >
      {@render children?.({ allowsRemoving, isSelected, isDisabled })}
    </span>
    {#if allowsRemoving}
      {#if remove}
        <span role="gridcell">{@render remove()}</span>
      {:else}
        <span role="gridcell" {...attributes(tagStyles.automaticRemove)}><TagRemoveButton /></span>
      {/if}
    {/if}
  </li>
{/if}
