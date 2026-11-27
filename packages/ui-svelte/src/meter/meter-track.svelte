<script lang="ts">
  import { meterStyles, meterTrackSizes } from "@lenso/tokens/meter";
  import type { ComponentProps } from "svelte";
  import { MeterTrack as Part } from "@ui-sdk/svelte/meter";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { size?: keyof typeof meterTrackSizes };
  let { size, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([meterStyles.track, meterTrackSizes[size ?? "md"]], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="meter-track" {...rest} {...presentation} />
