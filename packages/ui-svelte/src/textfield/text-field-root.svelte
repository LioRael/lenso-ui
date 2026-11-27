<script lang="ts">
  import { textFieldStyles } from "@lenso/tokens/textfield";
  import type { ComponentProps } from "svelte";
  import { Field as Part } from "@ui-sdk/svelte/field";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { layout?: "row" | "stacked" };
  let { layout, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [textFieldStyles.root, layout === "row" && textFieldStyles.row],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="textfield" {...rest} {...presentation} />
