<script lang="ts">
  import { textFieldStyles } from "@lenso/tokens/textfield";
  import { groupStyles } from "@lenso/tokens/surface";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: SvelteHTMLElements["fieldset"] & StyleXProps = $props();
  const presentation = $derived(
    styled(
      [groupStyles.surface, groupStyles.group, textFieldStyles.group],
      xstyle,
      className,
      style,
    ),
  );
</script>

<fieldset data-lenso-slot="textfield-group" {...rest} {...presentation}>
  {@render children?.()}
</fieldset>
