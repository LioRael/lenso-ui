<script module lang="ts">
  export type Props = ComponentProps<typeof Part> & Record<never, never>;
</script>

<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Drawer as Part } from "@ui-sdk/svelte/drawer";

  let { open = $bindable(), snapPoint = $bindable(), ...rest }: Props = $props();
</script>

<Part {...rest} bind:open bind:snapPoint />
