<script lang="ts">
  import { selectStyles } from "@lenso/tokens/select";
  import { menuStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { ComboboxList as Part } from "@ui-sdk/svelte/combobox";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([menuStyles.content, selectStyles.list], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="combo-box-list" {...rest} {...presentation} />
