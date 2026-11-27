<script lang="ts">
  import { menuStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { MenuTrigger as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  import { useMenuSourceRef } from "../menu/context.js";
  const source = useMenuSourceRef();
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(menuStyles.trigger, xstyle, className, style));
</script>

<Part {@attach source} data-lenso-slot="menu-trigger" {...rest} {...presentation} />
