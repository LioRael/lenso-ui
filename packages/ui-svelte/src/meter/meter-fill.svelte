<script lang="ts">
  import { meterStyles, meterFillSizes } from "@lenso/tokens/meter";
  import type { ComponentProps } from "svelte";
  import { MeterIndicator as Part } from "@ui-sdk/svelte/meter";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { size?: keyof typeof meterFillSizes };
  let { size, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([meterStyles.fill, meterFillSizes[size ?? "md"]], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="meter-fill" {...rest} {...presentation} />
