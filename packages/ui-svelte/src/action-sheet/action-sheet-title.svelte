<script lang="ts">
  import { actionSheetStyles } from "@lenso/tokens/action-sheet";
  import type { ComponentProps } from "svelte";
  import { DialogTitle as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(actionSheetStyles.title, xstyle, className, style));
</script>

<Part data-lenso-slot="action-sheet-title" {...rest} {...presentation} />
