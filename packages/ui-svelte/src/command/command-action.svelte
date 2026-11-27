<script module lang="ts">
  export type Props = ComponentProps<typeof Base> & Record<never, never>;
</script>

<script lang="ts">
  import { GlassButton as Base } from "../glass-button/index.js";
  import { commandStyles } from "@lenso/tokens/command";
  import type { ComponentProps } from "svelte";
  let { xstyle, ...rest }: Props = $props();
</script>

<Base
  size="sm"
  data-lenso-slot="command-action"
  {...rest}
  xstyle={[commandStyles.action, xstyle]}
/>
