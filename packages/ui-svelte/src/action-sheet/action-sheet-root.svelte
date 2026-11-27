<script module lang="ts">
  export type Props = ComponentProps<typeof Part> & Record<never, never>;
</script>

<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Dialog as Part } from "@ui-sdk/svelte/dialog";

  let { open = $bindable(), ...rest }: Props = $props();
</script>

<Part {...rest} bind:open />
