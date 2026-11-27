<script lang="ts">
  import type { Snippet } from "svelte";
  import { setWindowRow } from "./context.js";

  let { index, height, children }: { index: number; height: number; children: Snippet } = $props();
  setWindowRow(() => ({ index, height }));
</script>

{@render children()}
