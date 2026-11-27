<script module lang="ts">
  export type Props = ComponentProps<typeof Part> & { compact?: boolean };
</script>

<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Part from "../menu/menu-root.svelte";
  import { setCompact } from "./context.js";

  let { compact, onOpenChange, open = $bindable(), ...rest }: Props = $props();
  let expanded = $state(false);
  setCompact({ active: () => !!compact && !expanded, expand: () => (expanded = true) });
</script>

<Part
  {...rest}
  bind:open
  onOpenChange={(next, details) => {
    onOpenChange?.(next, details);
    if (next && !details.canceled) expanded = false;
  }}
/>
