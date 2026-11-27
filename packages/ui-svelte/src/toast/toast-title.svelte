<script lang="ts">
  import { toastStyles as s } from "@lenso/tokens/toast";
  import { ToastTitle as Part } from "@ui-sdk/svelte/toast";
  import type { ComponentProps } from "svelte";
  import { styled, type StyleXProps } from "../styled.js";
  import PillSwap from "./pill-swap.svelte";
  import { getToastAppearance, getToastData } from "./context.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, children: content, ...rest }: Props = $props();
  const toast = getToastData();
  const appearance = getToastAppearance();
  const title = $derived(toast?.().title);
  const presentation = $derived(
    styled([s.title, appearance?.pill() && s.pillTitle], xstyle, className, style),
  );
</script>

{#if appearance?.pill()}
  <Part data-lenso-slot="toast-title" {...rest} {...presentation}>
    {#snippet children(state)}
      <PillSwap identity={content ?? title} clip>
        {#if content}{@render content(
            state,
          )}{:else if typeof title === "function"}{@render title()}{:else}{title}{/if}
      </PillSwap>
    {/snippet}
  </Part>
{:else}
  <Part data-lenso-slot="toast-title" {...rest} {...presentation} children={content} />
{/if}
