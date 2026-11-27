<script lang="ts">
  import { notificationStyles } from "@lenso/tokens/notification";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps = $props();
  const presentation = $derived(styled(notificationStyles.header, xstyle, className, style));
</script>

<div data-lenso-slot="notification-header" {...rest} {...presentation}>
  {@render children?.()}
</div>
