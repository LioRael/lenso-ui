<script lang="ts">
  import { menuSectionStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { SelectGroupLabel as Part } from "@ui-sdk/svelte/select";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuSectionStyles.label, xstyle, className, style));
</script>

<Part data-lenso-slot="select-group-label" {...rest} {...presentation} />
