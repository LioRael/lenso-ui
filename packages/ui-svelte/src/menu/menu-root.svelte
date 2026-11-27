<script module lang="ts">
  export type Props = ComponentProps<typeof Part> & Record<never, never>;
</script>

<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Menu as Part } from "@ui-sdk/svelte/menu";

  import { setMenuSource } from "./context.js";
  setMenuSource({ current: null });
  let { open = $bindable(), ...rest }: Props = $props();
</script>

<Part {...rest} bind:open />
