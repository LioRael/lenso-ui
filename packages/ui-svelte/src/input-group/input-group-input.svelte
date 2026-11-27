<script lang="ts">
  import { inputStyles } from "@lenso/tokens/input";
  import type { ComponentProps } from "svelte";
  import { Input as Part } from "@ui-sdk/svelte/input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([inputStyles.input, inputStyles.groupedControl], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="input-group-input" {...rest} {...presentation} bind:value />
