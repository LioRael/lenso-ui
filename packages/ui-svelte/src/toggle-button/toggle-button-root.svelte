<script lang="ts">
  import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
  import { buttonStyles, buttonVariants, buttonSizes } from "@lenso/tokens/button";
  import type { ComponentProps } from "svelte";
  import { Toggle as Part } from "@ui-sdk/svelte/toggle";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { size?: keyof typeof buttonSizes; variant?: keyof typeof buttonVariants };
  let {
    size,
    variant,
    pressed = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  const presentation = $derived(
    styled(
      [
        buttonStyles.root,
        buttonStyles.tracking,
        buttonSizes[size ?? "md"],
        buttonVariants[variant ?? "bordered"],
        toggleButtonStyles.selected,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="toggle-button" {...rest} {...presentation} bind:pressed />
