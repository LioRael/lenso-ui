<script lang="ts">
  import { textFieldStyles } from "@lenso/tokens/textfield";
  import { inputStyles } from "@lenso/tokens/input";
  import type { ComponentProps } from "svelte";
  import { Input as Part } from "@ui-sdk/svelte/input";
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
        inputStyles.input,
        textFieldStyles.control,
        variant === "secondary" && inputStyles.secondary,
        fullWidth && inputStyles.fullWidth,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="textfield-input" {...rest} {...presentation} bind:value />
