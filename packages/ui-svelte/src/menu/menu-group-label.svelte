<script lang="ts">
  import { menuSectionStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { MenuGroupLabel as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([menuSectionStyles.label, menuSectionStyles.menuLabel], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="menu-group-label" {...rest} {...presentation} />
