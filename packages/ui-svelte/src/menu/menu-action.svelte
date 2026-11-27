<script module lang="ts">
  export type Props = ComponentProps<typeof Base> & Record<never, never>;
</script>

<script lang="ts">
  import Base from "./menu-item.svelte";
  import { menuStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  let { xstyle, ...rest }: Props = $props();
</script>

<Base data-lenso-slot="menu-action" {...rest} xstyle={[menuStyles.action, xstyle]} />
