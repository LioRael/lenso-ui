<script lang="ts">
  import { listBoxSectionLabelStyles } from "@lenso/tokens/list-box";
  import type { ComponentProps } from "svelte";
  import { ListboxGroupLabel as Part } from "@ui-sdk/svelte/listbox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(listBoxSectionLabelStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="list-box-section-label" {...rest} {...presentation} />
