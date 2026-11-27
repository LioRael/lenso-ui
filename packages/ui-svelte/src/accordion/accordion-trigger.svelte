<script lang="ts">
  import { accordionStyles } from "@lenso/tokens/accordion";
  import type { ComponentProps } from "svelte";
  import { AccordionTrigger as Part } from "@ui-sdk/svelte/accordion";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(accordionStyles.trigger, xstyle, className, style));
</script>

<Part data-lenso-slot="accordion-trigger" {...rest} {...presentation} />
