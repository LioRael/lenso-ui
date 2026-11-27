<script lang="ts">
  import { radioStyles } from "@lenso/tokens/radio";
  import type { ComponentProps } from "svelte";
  import { RadioIndicator as Part } from "@ui-sdk/svelte/radio";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(radioStyles.indicator, xstyle, className, style));
</script>

<Part data-lenso-slot="radio-indicator" {...rest} {...presentation} />
