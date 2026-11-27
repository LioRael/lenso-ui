<script lang="ts">
  import { actionSheetStyles } from "@lenso/tokens/action-sheet";
  import type { ComponentProps } from "svelte";
  import { DialogClose as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { destructive?: boolean };
  let { destructive, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [actionSheetStyles.action, destructive && actionSheetStyles.destructive],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="action-sheet-action" {...rest} {...presentation} />
