<script lang="ts">
  import { menuSectionStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { MenuGroup as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuSectionStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="menu-group" {...rest} {...presentation} />
