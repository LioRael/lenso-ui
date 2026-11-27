<script lang="ts">
  import { menuStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { Button as Part } from "@ui-sdk/svelte/button";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuStyles.barItem, xstyle, className, style));
</script>

<Part data-lenso-slot="menu-bar-item" {...rest} {...presentation} />
