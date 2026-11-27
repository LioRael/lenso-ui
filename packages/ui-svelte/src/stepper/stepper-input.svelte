<script lang="ts">
  import { stepperStyles } from "@lenso/tokens/stepper";
  import type { ComponentProps } from "svelte";
  import { NumberInputControl as Part } from "@ui-sdk/svelte/number-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(stepperStyles.input, xstyle, className, style));
</script>

<Part data-lenso-slot="stepper-input" {...rest} {...presentation} />
