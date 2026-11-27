<script lang="ts">
  import {
    progressCircleColors,
    progressCircleSizes,
    progressCircleStyles,
  } from "@lenso/tokens/progress-circle";
  import type { ComponentProps } from "svelte";
  import { Progress as Part } from "@ui-sdk/svelte/progress";
  import { styled, type StyleXProps } from "../styled.js";

  import { setProgress } from "./context.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & {
      color?: keyof typeof progressCircleColors;
      size?: keyof typeof progressCircleSizes;
    };
  let {
    color,
    size = "md",
    value,
    min = 0,
    max = 100,
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  setProgress(() => ({ size, value, min, max }));
  const presentation = $derived(
    styled(
      [progressCircleStyles.root, progressCircleColors[color ?? "accent"]],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="progress-circle" {value} {min} {max} {...rest} {...presentation} />
