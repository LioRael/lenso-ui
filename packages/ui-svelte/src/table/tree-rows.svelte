<script lang="ts">
  import type { Snippet } from "svelte";
  import { setDepth, setWindowRow } from "./context.js";

  let { depth, children }: { depth: number; children: Snippet } = $props();
  setDepth(() => depth);
  setWindowRow(() => undefined);
</script>

{@render children()}
