<script lang="ts">
  import { commandStyles } from "@lenso/tokens/command";
  import type { ComponentProps } from "svelte";
  import { DialogBackdrop as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(commandStyles.backdrop, xstyle, className, style));
</script>

<Part data-lenso-slot="command-backdrop" {...rest} {...presentation} />
