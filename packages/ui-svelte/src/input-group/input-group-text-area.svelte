<script lang="ts">
  import { inputStyles } from "@lenso/tokens/input";
  import { textAreaInputStyles } from "@lenso/tokens/textarea";
  import type { ComponentProps } from "svelte";
  import { Textarea as Part } from "@ui-sdk/svelte/textarea";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [textAreaInputStyles.input, inputStyles.groupedControl, inputStyles.groupedTextArea],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="input-group-textarea" {...rest} {...presentation} bind:value />
