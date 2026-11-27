<script lang="ts">
  import { alertDialogStyles } from "@lenso/tokens/alert-dialog";
  import type { ComponentProps } from "svelte";
  import { AlertDialogTitle as Part } from "@ui-sdk/svelte/alert-dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(alertDialogStyles.title, xstyle, className, style));
</script>

<Part data-lenso-slot="alert-dialog-title" {...rest} {...presentation} />
