<script lang="ts">
  import { sheetStyles } from "@lenso/tokens/sheet";
  import type { ComponentProps } from "svelte";
  import { DrawerHandle as Part } from "@ui-sdk/svelte/drawer";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(sheetStyles.handle, xstyle, className, style));
</script>

<Part data-lenso-slot="sheet-handle" {...rest} {...presentation} />
