<script lang="ts">
  import { progressBarStyles } from "@lenso/tokens/progress-bar";
  import type { ComponentProps } from "svelte";
  import { ProgressLabel as Part } from "@ui-sdk/svelte/progress";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(progressBarStyles.label, xstyle, className, style));
</script>

<Part data-lenso-slot="label" {...rest} {...presentation} />
