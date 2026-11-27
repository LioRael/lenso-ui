<script module lang="ts">
  export type Props = ComponentProps<typeof Next> & Record<never, never>;
</script>

<script lang="ts">
  import Previous from "./calendar-previous.svelte";
  import Next from "./calendar-next.svelte";
  import type { ComponentProps } from "svelte";
  let { slot, ...rest }: Props = $props();
</script>

{#if slot === "previous"}<Previous {...rest} />{:else}<Next {...rest} />{/if}
