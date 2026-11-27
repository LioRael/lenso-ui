<script module lang="ts">
  export type Props = ComponentProps<typeof Base> & Record<never, never>;
</script>

<script lang="ts">
  import Base from "../menu/menu-item.svelte";
  import { menuStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  import { contextMenuStyles } from "@lenso/tokens/context-menu";
  let { xstyle, ...rest }: Props = $props();
</script>

<Base
  data-lenso-slot="context-menu-bar-item"
  {...rest}
  xstyle={[menuStyles.barItem, contextMenuStyles.barItem, xstyle]}
/>
