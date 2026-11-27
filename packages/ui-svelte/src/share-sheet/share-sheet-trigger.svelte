<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { DrawerTrigger as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(undefined, xstyle, className, style));
</script>

<Part data-lenso-slot="share-sheet-trigger" {...rest} {...presentation} />
