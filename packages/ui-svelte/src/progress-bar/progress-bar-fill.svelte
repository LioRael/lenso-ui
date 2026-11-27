<script lang="ts">
  import { progressBarStyles, progressBarFillSizes } from "@lenso/tokens/progress-bar";
  import type { ComponentProps } from "svelte";
  import { ProgressIndicator as Part } from "@ui-sdk/svelte/progress";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { size?: keyof typeof progressBarFillSizes };
  let { size, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([progressBarStyles.fill, progressBarFillSizes[size ?? "md"]], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="progress-bar-fill" {...rest} {...presentation} />
