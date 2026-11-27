<script lang="ts" generics="Payload = unknown">
  import { commandStyles } from "@lenso/tokens/command";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { DialogContent as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled(
      [materialStyles.root, materialStyles.accessible, commandStyles.popup],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="command-content" {...rest} {...presentation} />
