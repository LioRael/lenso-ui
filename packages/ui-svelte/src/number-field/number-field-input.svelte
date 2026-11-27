<script lang="ts">
  import { numberFieldStyles } from "@lenso/tokens/number-field";
  import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
  import type { ComponentProps } from "svelte";
  import { NumberInputControl as Part } from "@ui-sdk/svelte/number-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([numberFieldStyles.input, inputGroupMaterialStyles.input], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="number-field-input" {...rest} {...presentation} />
