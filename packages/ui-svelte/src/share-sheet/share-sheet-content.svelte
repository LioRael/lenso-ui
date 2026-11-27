<script lang="ts" generics="Payload = unknown">
  import { shareSheetStyles } from "@lenso/tokens/share-sheet";
  import { sheetStyles } from "@lenso/tokens/sheet";
  import type { ComponentProps } from "svelte";
  import { DrawerContent as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled([sheetStyles.nativeContent, shareSheetStyles.popup], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="share-sheet-content" {...rest} {...presentation} />
