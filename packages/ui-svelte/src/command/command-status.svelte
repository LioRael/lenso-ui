<script lang="ts">
  import { commandStyles } from "@lenso/tokens/command";
  import type { ComponentProps } from "svelte";
  import { CommandStatus as Part } from "@ui-sdk/svelte/command";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(commandStyles.status, xstyle, className, style));
</script>

<Part data-lenso-slot="command-status" {...rest} {...presentation} />
