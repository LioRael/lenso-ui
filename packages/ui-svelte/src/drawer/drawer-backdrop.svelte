<script lang="ts">
  import { drawerStyles } from "@lenso/tokens/drawer";
  import { modalStyles } from "@lenso/tokens/modal";
  import type { ComponentProps } from "svelte";
  import { DrawerBackdrop as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { variant?: "transparent" | "opaque" | "blur" };
  let { variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([drawerStyles.backdrop, modalStyles[variant ?? "opaque"]], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="drawer-backdrop" {...rest} {...presentation} />
