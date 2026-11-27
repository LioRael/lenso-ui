<script lang="ts">
  import { labelStyles } from "@lenso/tokens/label";
  import { textFieldStyles } from "@lenso/tokens/textfield";
  import type { ComponentProps } from "svelte";
  import { FieldLabel as Part } from "@ui-sdk/svelte/field";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([labelStyles.label, textFieldStyles.rowLabel], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="label" {...rest} {...presentation} />
