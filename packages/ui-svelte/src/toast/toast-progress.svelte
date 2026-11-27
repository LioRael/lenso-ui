<script module lang="ts">
  export type ToastProgressProps = ComponentProps<typeof ProgressCircle.Root> &
    Record<never, never>;
</script>

<script lang="ts">
  import { toastStyles as s } from "@lenso/tokens/toast";
  import type { ComponentProps } from "svelte";
  import { ProgressCircle } from "../progress-circle/index.js";
  import { attributes } from "../styled.js";
  import Digit from "./pill-digit.svelte";

  let {
    value,
    min = 0,
    max = 100,
    xstyle,
    children: content,
    ...rest
  }: ToastProgressProps = $props();
  const percent = $derived(
    max > min
      ? Math.round(Math.max(0, Math.min(1, ((value ?? min) - min) / (max - min))) * 100)
      : 0,
  );
  const places = [100, 10, 1] as const;
</script>

<ProgressCircle.Root
  {...rest}
  {value}
  {min}
  {max}
  data-lenso-slot="toast-progress"
  xstyle={[s.pillProgress, xstyle]}
>
  {#snippet children(state)}
    <ProgressCircle.Track xstyle={s.pillProgressTrack}>
      <ProgressCircle.TrackCircle xstyle={s.pillProgressTrackCircle} />
      <ProgressCircle.FillCircle xstyle={s.progressFill} />
    </ProgressCircle.Track>
    {@render content?.(state)}
    {#if value != null}
      <span aria-hidden="true" {...attributes(s.pillProgressValue)}>
        <span {...attributes(s.number)}>
          {#each places as place (place)}<Digit value={percent} {place} />{/each}
        </span>%
      </span>
    {/if}
  {/snippet}
</ProgressCircle.Root>
