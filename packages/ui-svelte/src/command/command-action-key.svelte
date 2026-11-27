<script lang="ts">
  import { Kbd as Base } from "../kbd/index.js";
  import { commandStyles } from "@lenso/tokens/command";
  import type { ComponentProps } from "svelte";
  let { xstyle, ...rest }: ComponentProps<typeof Base> = $props();
</script>

<Base
  variant="light"
  data-lenso-slot="command-action-key"
  {...rest}
  xstyle={[commandStyles.actionKey, xstyle]}
/>
