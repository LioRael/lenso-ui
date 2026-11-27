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
  }: SvelteHTMLElements["time"] & StyleXProps = $props();
  const presentation = $derived(styled(notificationStyles.time, xstyle, className, style));
</script>

<time data-lenso-slot="notification-time" {...rest} {...presentation}>
  {@render children?.()}
</time>
