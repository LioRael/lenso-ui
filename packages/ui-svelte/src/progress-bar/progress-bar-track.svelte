<script lang="ts">
  import { progressBarStyles, progressBarTrackSizes } from "@lenso/tokens/progress-bar";
  import type { ComponentProps } from "svelte";
  import { ProgressTrack as Part } from "@ui-sdk/svelte/progress";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { size?: keyof typeof progressBarTrackSizes };
  let { size, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [progressBarStyles.track, progressBarTrackSizes[size ?? "md"]],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="progress-bar-track" {...rest} {...presentation} />
