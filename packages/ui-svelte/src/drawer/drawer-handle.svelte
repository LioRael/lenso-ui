<script lang="ts">
  import { drawerStyles } from "@lenso/tokens/drawer";
  import type { ComponentProps } from "svelte";
  import { DrawerHandle as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(drawerStyles.handle, xstyle, className, style));
</script>

<Part data-lenso-slot="drawer-handle" {...rest} {...presentation} />
