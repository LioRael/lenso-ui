<script lang="ts">
  import { sheetStyles } from "@lenso/tokens/sheet";
  import type { ComponentProps } from "svelte";
  import { DrawerBackdrop as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { dim?: boolean };
  let { dim, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([sheetStyles.backdrop, dim === false && sheetStyles.undimmed], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="sheet-backdrop" {...rest} {...presentation} />
