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
  const presentation = $derived(styled(notificationStyles.description, xstyle, className, style));
</script>

<div data-lenso-slot="notification-description" {...rest} {...presentation}>
  {@render children?.()}
</div>
