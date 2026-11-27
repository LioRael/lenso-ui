<script lang="ts">
  import { menuItemStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { MenuCheckboxItem as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { checked = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuItemStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="menu-checkbox-item" {...rest} {...presentation} bind:checked />
