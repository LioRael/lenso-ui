<script module lang="ts">
  export type ToastRegionProps = ComponentProps<typeof Part> &
    StyleXProps & { variant?: ToastVariant };
</script>

<script lang="ts">
  import { toastStyles } from "@lenso/tokens/toast";
  import { ToastRegion as Part } from "@ui-sdk/svelte/toast";
  import type { ComponentProps } from "svelte";
  import { styled, type StyleXProps } from "../styled.js";
  import type { ToastVariant } from "./context.js";
  import Data from "./toast-data.svelte";
  import Root from "./toast-root.svelte";
  import Content from "./toast-content.svelte";
  import Title from "./toast-title.svelte";
  import Description from "./toast-description.svelte";
  import Action from "./toast-action.svelte";
  import Close from "./toast-close.svelte";

  let {
    variant,
    children: content,
    side = "bottom",
    align = "center",
    xstyle,
    class: className,
    style,
    ...rest
  }: ToastRegionProps = $props();
  const presentation = $derived(styled(toastStyles.viewport, xstyle, className, style));
</script>

<Part data-lenso-slot="toast-region" {side} {align} {...rest} {...presentation}>
  {#snippet children(data, item)}
    <Data {data}>
      {#if content}
        {@render content(data, item)}
      {:else}
        <Root {variant}>
          <Content><Title /><Description /><Action /><Close /></Content>
        </Root>
      {/if}
    </Data>
  {/snippet}
</Part>
