<script lang="ts">
  import { meterStyles } from "@lenso/tokens/meter";
  import type { ComponentProps } from "svelte";
  import { MeterValue as Part } from "@ui-sdk/svelte/meter";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(meterStyles.output, xstyle, className, style));
</script>

<Part data-lenso-slot="meter-output" {...rest} {...presentation} />
