<script lang="ts" generics="Payload = unknown">
  import { actionSheetStyles } from "@lenso/tokens/action-sheet";
  import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { DialogContent as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        liquidMaterialStyles.small,
        liquidMaterialStyles.medium,
        actionSheetStyles.popup,
        actionSheetStyles.nativeContent,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="action-sheet-content" {...rest} {...presentation} />
