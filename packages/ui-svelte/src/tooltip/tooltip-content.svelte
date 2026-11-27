<script lang="ts" generics="Payload = unknown">
  import { tooltipStyles } from "@lenso/tokens/tooltip";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { TooltipContent as Part } from "@ui-sdk/svelte/tooltip";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        materialStyles.blur,
        tooltipStyles.positioner,
        tooltipStyles.popup,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="tooltip-content" {...rest} {...presentation} />
