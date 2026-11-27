<script lang="ts">
  import { textAreaStyles, textAreaInputStyles } from "@lenso/tokens/textarea";
  import type { ComponentProps } from "svelte";
  import { Textarea as Part } from "@ui-sdk/svelte/textarea";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { variant?: "primary" | "secondary"; fullWidth?: boolean };
  let {
    variant,
    fullWidth,
    value = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  const presentation = $derived(
    styled(
      [
        textAreaInputStyles.input,
        textAreaStyles.textarea,
        rest.rows === 1 && textAreaStyles.singleLine,
        variant === "secondary" && textAreaInputStyles.secondary,
        fullWidth && textAreaInputStyles.fullWidth,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="textarea" {...rest} {...presentation} bind:value />
