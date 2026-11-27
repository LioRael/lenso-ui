<script lang="ts">
  import { toastStyles } from "@lenso/tokens/toast";
  import type { ComponentProps } from "svelte";
  import { ToastDescription as Part } from "@ui-sdk/svelte/toast";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(toastStyles.description, xstyle, className, style));
</script>

<Part data-lenso-slot="toast-description" {...rest} {...presentation} />
