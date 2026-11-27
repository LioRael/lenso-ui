<script lang="ts">
  import { contextMenuStyles } from "@lenso/tokens/context-menu";
  import type { ComponentProps } from "svelte";
  import { MenuContextTrigger as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  import { useMenuSourceRef } from "../menu/context.js";
  const source = useMenuSourceRef();
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(contextMenuStyles.trigger, xstyle, className, style));
</script>

<Part
  tabindex={0}
  {@attach source}
  data-lenso-slot="context-menu-trigger"
  {...rest}
  {...presentation}
/>
