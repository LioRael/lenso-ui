<script module lang="ts">
  export type Props = ComponentProps<typeof Base> & Record<never, never>;
</script>

<script lang="ts">
  import Base from "./menu-trigger.svelte";
  import { menuStyles } from "@lenso/tokens/menu";
  import type { ComponentProps } from "svelte";
  let { xstyle, ...rest }: Props = $props();
</script>

<Base
  aria-label="More actions"
  data-lenso-slot="menu-expand-trigger"
  {...rest}
  xstyle={[menuStyles.expand, xstyle]}
/>
