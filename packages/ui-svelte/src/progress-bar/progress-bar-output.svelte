<script lang="ts">
  import { progressBarStyles } from "@lenso/tokens/progress-bar";
  import type { ComponentProps } from "svelte";
  import { ProgressValue as Part } from "@ui-sdk/svelte/progress";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(progressBarStyles.output, xstyle, className, style));
</script>

<Part data-lenso-slot="progress-bar-output" {...rest} {...presentation} />
