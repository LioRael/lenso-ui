<script lang="ts">
  import { inputStyles } from "@lenso/tokens/input";
  import type { ComponentProps } from "svelte";
  import { InputGroup as Part } from "@ui-sdk/svelte/input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { variant?: "primary" | "secondary"; fullWidth?: boolean };
  let { variant, fullWidth, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        inputStyles.input,
        inputStyles.group,
        variant === "secondary" && inputStyles.secondary,
        fullWidth && inputStyles.fullWidth,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="input-group" {...rest} {...presentation} />
