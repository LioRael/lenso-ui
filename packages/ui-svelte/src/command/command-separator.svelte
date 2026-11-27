<script lang="ts">
  import { commandStyles } from "@lenso/tokens/command";
  import type { ComponentProps } from "svelte";
  import { CommandSeparator as Part } from "@ui-sdk/svelte/command";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(commandStyles.separator, xstyle, className, style));
</script>

<Part data-lenso-slot="command-separator" {...rest} {...presentation} />
