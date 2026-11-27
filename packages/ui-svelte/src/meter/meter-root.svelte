<script lang="ts">
  import { meterStyles, meterColors } from "@lenso/tokens/meter";
  import type { ComponentProps } from "svelte";
  import { Meter as Part } from "@ui-sdk/svelte/meter";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { color?: keyof typeof meterColors };
  let { color, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([meterStyles.root, meterColors[color ?? "default"]], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="meter" {...rest} {...presentation} />
