<script lang="ts">
  import { tableStyles as s } from "@lenso/tokens/table";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  import { setVariant } from "./context.js";

  let {
    variant = "primary",
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["div"] & StyleXProps & { variant?: "primary" | "secondary" } = $props();
  setVariant(() => variant);
  const presentation = $derived(
    styled([s.root, variant === "primary" && s.primary], xstyle, className, style),
  );
</script>

<div data-lenso-slot="table" {...rest} {...presentation}>
  {@render children?.()}
</div>
