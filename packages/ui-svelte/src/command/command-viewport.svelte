<script lang="ts">
  import { ScrollShadow as Base } from "../scroll-shadow/index.js";
  import { commandStyles } from "@lenso/tokens/command";
  import type { ComponentProps } from "svelte";
  let { xstyle, ...rest }: ComponentProps<typeof Base> = $props();
</script>

<Base data-lenso-slot="command-viewport" {...rest} xstyle={[commandStyles.viewport, xstyle]} />
