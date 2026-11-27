<script module lang="ts">
  export type Props = ComponentProps<typeof Base> & Record<never, never>;
</script>

<script lang="ts">
  import Base from "./menu-group.svelte";
  import { menuStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  let { xstyle, ...rest }: Props = $props();
</script>

<Base data-lenso-slot="menu-action-group" {...rest} xstyle={[menuStyles.actionGroup, xstyle]} />
