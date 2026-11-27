<script lang="ts" generics="Payload = unknown">
  import { sheetStyles } from "@lenso/tokens/sheet";
  import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { DrawerContent as Part } from "@ui-sdk/svelte/drawer";
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
        sheetStyles.popup,
        sheetStyles.nativeContent,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="sheet-content" {...rest} {...presentation} />
