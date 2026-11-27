<script lang="ts">
  import { progressBarStyles, progressBarColors } from "@lenso/tokens/progress-bar";
  import type { ComponentProps } from "svelte";
  import { Progress as Part } from "@ui-sdk/svelte/progress";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { color?: keyof typeof progressBarColors };
  let { color, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [progressBarStyles.root, progressBarColors[color ?? "default"]],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="progress-bar" {...rest} {...presentation} />
