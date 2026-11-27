<script lang="ts">
  import { RadioVariantContext, type RadioVariant } from "../radio/variant.js";
  import { radioGroupStyles } from "@lenso/tokens/radio-group";
  import type { ComponentProps } from "svelte";
  import { RadioGroup as Part } from "@ui-sdk/svelte/radio";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { variant?: RadioVariant };
  let { variant, value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  RadioVariantContext.set(() => variant ?? "primary");
  const presentation = $derived(styled(radioGroupStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="radio-group" {...rest} {...presentation} bind:value />
