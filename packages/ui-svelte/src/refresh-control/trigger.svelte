<script module lang="ts">
  export type RefreshControlTriggerProps = ComponentProps<typeof Button> & StyleXProps;
</script>

<script lang="ts">
  import { refreshControlStyles as s } from "@lenso/tokens/refresh-control";
  import { Button } from "@ui-sdk/svelte/button";
  import type { ComponentProps } from "svelte";
  import { styled, type StyleXProps } from "../styled.js";
  import { getRefresh } from "./context.js";

  let {
    children: content,
    disabled,
    onclick,
    xstyle,
    class: className,
    style,
    ...rest
  }: RefreshControlTriggerProps = $props();
  const refresh = getRefresh();
  const presentation = $derived(styled(!rest.render && s.trigger, xstyle, className, style));
</script>

<Button
  data-lenso-slot="refresh-control-trigger"
  {...rest}
  {...presentation}
  disabled={disabled || refresh.disabled()}
  onclick={(event, details) => {
    onclick?.(event, details);
    if (!event.defaultPrevented) return refresh.refresh();
  }}
>
  {#snippet children(state)}
    {#if content}{@render content(state)}{:else}{refresh.label()}{/if}
  {/snippet}
</Button>
