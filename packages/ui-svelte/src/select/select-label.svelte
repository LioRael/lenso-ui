<script lang="ts">
  import { selectStyles } from "@lenso/tokens/select";
  import type { ComponentProps } from "svelte";
  import { SelectLabel as Part } from "@ui-sdk/svelte/select";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(selectStyles.label, xstyle, className, style));
</script>

<Part data-lenso-slot="label" {...rest} {...presentation} />
