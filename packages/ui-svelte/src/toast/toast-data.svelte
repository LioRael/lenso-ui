<script lang="ts">
  import type { ToastData } from "@ui-sdk/svelte/toast";
  import type { Snippet } from "svelte";
  import { setToastData, type ToastContentValue } from "./context.js";

  let { data, children }: { data: ToastData<ToastContentValue>; children: Snippet } = $props();
  setToastData(() => data);
</script>

{@render children()}
