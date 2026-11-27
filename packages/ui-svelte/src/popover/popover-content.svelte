<script lang="ts" generics="Payload = unknown">
  import { popoverStyles } from "@lenso/tokens/popover";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { PopoverContent as Part } from "@ui-sdk/svelte/popover";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        materialStyles.blur,
        popoverStyles.positioner,
        popoverStyles.popup,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="popover-content" {...rest} {...presentation} />
