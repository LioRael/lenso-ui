<script lang="ts">
  import { menuItemStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { MenuItem as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { variant?: "default" | "danger" };
  let { variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [menuItemStyles.root, variant === "danger" && menuItemStyles.danger],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="menu-item" {...rest} {...presentation} />
