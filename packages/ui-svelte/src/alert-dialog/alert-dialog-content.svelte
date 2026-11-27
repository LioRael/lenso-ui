<script lang="ts" generics="Payload = unknown">
  import { alertDialogStyles } from "@lenso/tokens/alert-dialog";
  import { materialStyles, liquidMaterialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { AlertDialogContent as Part } from "@ui-sdk/svelte/alert-dialog";
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
        alertDialogStyles.popup,
        alertDialogStyles.nativeContent,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="alert-dialog-content" {...rest} {...presentation} />
