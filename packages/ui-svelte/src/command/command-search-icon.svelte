<script lang="ts">
  import { SearchFieldIcon as Base } from "../search-field/index.js";
  import { commandStyles } from "@lenso/tokens/command";
  import type { ComponentProps } from "svelte";
  let { xstyle, ...rest }: ComponentProps<typeof Base> = $props();
</script>

<Base data-lenso-slot="command-search-icon" {...rest} xstyle={[commandStyles.searchIcon, xstyle]} />
