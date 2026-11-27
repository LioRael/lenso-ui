<script lang="ts">
  import { actionSheetStyles } from "@lenso/tokens/action-sheet";
  import type { ComponentProps } from "svelte";
  import { DialogBackdrop as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { dim?: boolean };
  let { dim, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [actionSheetStyles.backdrop, dim === false && actionSheetStyles.undimmed],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="action-sheet-backdrop" {...rest} {...presentation} />
