<script lang="ts">
  import { alertDialogStyles } from "@lenso/tokens/alert-dialog";
  import type { ComponentProps } from "svelte";
  import { AlertDialogClose as Part } from "@ui-sdk/svelte/alert-dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(alertDialogStyles.close, xstyle, className, style));
</script>

<Part data-lenso-slot="alert-dialog-close" {...rest} {...presentation} />
