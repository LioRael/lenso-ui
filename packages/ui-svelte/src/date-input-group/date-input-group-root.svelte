<script lang="ts">
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    variant,
    fullWidth,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["div"], "variant" | "fullWidth"> &
    StyleXProps & { variant?: "primary" | "secondary"; fullWidth?: boolean } = $props();
  const presentation = $derived(
    styled(
      [
        dateInputGroupStyles.root,
        variant === "secondary" && dateInputGroupStyles.secondary,
        fullWidth && dateInputGroupStyles.fullWidth,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="date-input-group" {...rest} {...presentation}>
  {@render children?.()}
</div>
