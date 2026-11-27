<script lang="ts">
  import { meterStyles } from "@lenso/tokens/meter";
  import type { ComponentProps } from "svelte";
  import { MeterLabel as Part } from "@ui-sdk/svelte/meter";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(meterStyles.label, xstyle, className, style));
</script>

<Part data-lenso-slot="label" {...rest} {...presentation} />
