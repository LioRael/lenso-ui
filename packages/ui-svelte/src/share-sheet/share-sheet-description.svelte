<script lang="ts">
  import { shareSheetStyles } from "@lenso/tokens/share-sheet";
  import type { ComponentProps } from "svelte";
  import { DrawerDescription as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(shareSheetStyles.description, xstyle, className, style));
</script>

<Part data-lenso-slot="share-sheet-description" {...rest} {...presentation} />
