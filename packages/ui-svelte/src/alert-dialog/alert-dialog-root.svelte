<script module lang="ts">
  export type Props = ComponentProps<typeof Part> & Record<never, never>;
</script>

<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { AlertDialog as Part } from "@ui-sdk/svelte/alert-dialog";

  let { open = $bindable(), ...rest }: Props = $props();
</script>

<Part {...rest} bind:open />
