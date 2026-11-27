<script lang="ts">
  import { buttonGroupStyles } from "@lenso/tokens/button-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  import { getButtonGroup } from "./context.js";
  const context = getButtonGroup();
  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["span"] & StyleXProps = $props();
  const presentation = $derived(
    styled(
      [
        buttonGroupStyles.separator,
        context?.().orientation === "vertical"
          ? buttonGroupStyles.separatorVertical
          : buttonGroupStyles.separatorHorizontal,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<span aria-hidden="true" data-lenso-slot="button-group-separator" {...rest} {...presentation}>
  {@render children?.()}
</span>
