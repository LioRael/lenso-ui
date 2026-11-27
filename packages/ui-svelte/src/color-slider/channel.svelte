<script lang="ts">
  import type { Snippet } from "svelte";
  import { setChannel } from "./context.js";
  let { value, children }: { value: number; children: Snippet } = $props();
  setChannel(() => value);
</script>

{@render children()}
