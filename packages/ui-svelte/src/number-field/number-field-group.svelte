<script lang="ts">
  import { numberFieldGroupStyles } from "@lenso/tokens/number-field";
  import { inputGroupMaterialStyles } from "@lenso/tokens/input-group";
  import type { ComponentProps } from "svelte";
  import { NumberInputGroup as Part } from "@ui-sdk/svelte/number-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { variant?: "primary" | "secondary"; fullWidth?: boolean };
  let { variant, fullWidth, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        numberFieldGroupStyles.root,
        inputGroupMaterialStyles.root,
        variant === "secondary" && inputGroupMaterialStyles.secondary,
        fullWidth && inputGroupMaterialStyles.fullWidth,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="number-field-group" {...rest} {...presentation} />
