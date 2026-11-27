<!-- Copyright 2026 HeroUI. SPDX-License-Identifier: Apache-2.0.
     Modified for Svelte composition with UI SDK state and Lenso StyleX. -->
<script lang="ts">
  import { checkboxStyles } from "@lenso/tokens/checkbox";
  import { CheckboxIndicator as SdkIndicator } from "@ui-sdk/svelte/checkbox";
  import type { ComponentProps } from "svelte";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof SdkIndicator> & StyleXProps;
  let { children: content, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(checkboxStyles.indicator, xstyle, className, style));
</script>

<SdkIndicator
  data-lenso-slot="checkbox-indicator"
  aria-hidden="true"
  keepMounted
  {...rest}
  {...presentation}
>
  {#snippet children(state)}
    {#if content}
      {@render content(state)}
    {:else}
      <svg
        {...attributes(checkboxStyles.checkmark)}
        viewBox="0 0 17 18"
        fill="none"
        stroke="currentColor"
        stroke-dasharray="22"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="1 9 7 14 15 4" />
      </svg>
      <svg
        {...attributes(checkboxStyles.indeterminate)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      >
        <line x1="21" x2="3" y1="12" y2="12" />
      </svg>
    {/if}
  {/snippet}
</SdkIndicator>
