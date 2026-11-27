<script lang="ts">
  import { menuItemStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { MenuShortcut as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuItemStyles.shortcut, xstyle, className, style));
</script>

<Part data-lenso-slot="menu-shortcut" {...rest} {...presentation} />
