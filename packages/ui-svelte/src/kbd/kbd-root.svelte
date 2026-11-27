<script lang="ts">
  import { kbdStyles } from "@lenso/tokens/kbd";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    variant,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["kbd"], "variant"> &
    StyleXProps & { variant?: "default" | "light" } = $props();
  const presentation = $derived(
    styled([kbdStyles.root, variant === "light" && kbdStyles.light], xstyle, className, style),
  );
</script>

<kbd data-lenso-slot="kbd" {...rest} {...presentation}>
  {@render children?.()}
</kbd>
