<script lang="ts">
  import { listBoxSectionStyles } from "@lenso/tokens/list-box";
  import type { ComponentProps } from "svelte";
  import { ListboxGroup as Part } from "@ui-sdk/svelte/listbox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(listBoxSectionStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="list-box-section" {...rest} {...presentation} />
