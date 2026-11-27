<script lang="ts">
  import { modalStyles } from "@lenso/tokens/modal";
  import type { ComponentProps } from "svelte";
  import { DialogClose as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(modalStyles.close, xstyle, className, style));
</script>

<Part data-lenso-slot="modal-close" {...rest} {...presentation} />
