<script lang="ts">
  import { toastStyles as s } from "@lenso/tokens/toast";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { Spinner } from "../spinner/index.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { getToastAppearance, getToastData, type ToastTone } from "./context.js";
  import PillSwap from "./pill-swap.svelte";

  let {
    variant,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps & { variant?: ToastTone } = $props();
  const appearance = getToastAppearance();
  const toast = getToastData();
  const loading = $derived(toast?.().type === "loading");
  const tone = $derived(variant ?? appearance?.tone() ?? "default");
  const pill = $derived(appearance?.pill());
  const presentation = $derived(
    styled([s.fading, s.indicator, pill && s.pillIndicator], xstyle, className, style),
  );
</script>

{#snippet icon()}
  {#if children}
    {@render children()}
  {:else if loading && pill}
    <span {...attributes(s.radialSpinner)}>
      {#each [0, 1, 2, 3, 4, 5, 6, 7] as index (index)}
        <span {...attributes(s.spinnerBar(index))}></span>
      {/each}
    </span>
  {:else if loading}
    <Spinner size="sm" color="current" />
  {:else}
    <svg
      aria-hidden="true"
      data-lenso-slot="toast-default-icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="1.65"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      {#if tone === "success"}
        <circle cx="10" cy="10" r="7.5" /><path d="m6.3 10 2.6 2.7 4.8-5" />
      {:else if tone === "warning"}
        <path d="m10 2.8 7.9 14H2.1zm0 5v3.8m0 2.3h.01" />
      {:else if tone === "danger"}
        <circle cx="10" cy="10" r="7.5" /><path d="m7.6 7.6 4.8 4.8m0-4.8-4.8 4.8" />
      {:else}
        <circle cx="10" cy="10" r="7.5" /><path d="M10 9v4.8m0-7.2h.01" />
      {/if}
    </svg>
  {/if}
{/snippet}

<span data-lenso-slot="toast-indicator" aria-hidden="true" {...rest} {...presentation}>
  {#if pill}
    <PillSwap identity={children ?? (loading ? "loading" : tone)}>{@render icon()}</PillSwap>
  {:else}
    {@render icon()}
  {/if}
</span>
