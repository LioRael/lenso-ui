<script lang="ts">
  import { selectStyles } from "@lenso/tokens/select";
  import { menuItemStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { SelectItem as Part } from "@ui-sdk/svelte/select";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([menuItemStyles.root, selectStyles.item], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="select-item" {...rest} {...presentation} />
