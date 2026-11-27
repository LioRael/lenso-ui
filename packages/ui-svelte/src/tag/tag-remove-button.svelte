<script lang="ts">
  import { tagStyles } from "@lenso/tokens/tag";
  import { Button as Part } from "@ui-sdk/svelte/button";
  import type { ComponentProps } from "svelte";
  import { styled, type StyleXProps } from "../styled.js";
  import { getTag } from "../tag-group/context.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  const tag = getTag();
  let {
    xstyle,
    class: className,
    style,
    children: content,
    onclick,
    disabled,
    ...rest
  }: Props = $props();
  const presentation = $derived(styled(tagStyles.removeButton, xstyle, className, style));
</script>

<Part
  data-lenso-slot="tag-remove-button"
  tabindex={-1}
  aria-label={tag?.label() ? `Remove ${tag.label()}` : "Remove tag"}
  {...rest}
  {...presentation}
  disabled={disabled || tag?.disabled()}
  onclick={(event, details) => {
    event.stopPropagation();
    const result = onclick?.(event, details);
    if (!event.defaultPrevented) tag?.remove(event);
    return result;
  }}
>
  {#snippet children(state)}
    {#if content}
      {@render content(state)}
    {:else}
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <path d="m3 3 6 6m0-6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>
    {/if}
  {/snippet}
</Part>
