<script lang="ts" generics="Payload = unknown">
  import { drawerStyles } from "@lenso/tokens/drawer";
  import type { ComponentProps } from "svelte";
  import { DrawerContent as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled([drawerStyles.popup, drawerStyles.nativeContent], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="drawer-content" {...rest} {...presentation} />
