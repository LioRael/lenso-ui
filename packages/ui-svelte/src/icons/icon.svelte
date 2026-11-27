<script lang="ts">
  import { iconShapes } from "@lenso/tokens/icons";
  import type { SvelteHTMLElements } from "svelte/elements";
  let {
    name,
    ...rest
  }: Omit<SvelteHTMLElements["svg"], "name"> & { name: keyof typeof iconShapes } = $props();
  const shape = $derived(iconShapes[name]);
</script>

<svg
  aria-hidden="true"
  role="presentation"
  fill="none"
  height={shape.size}
  width={shape.size}
  viewBox={shape.viewBox}
  xmlns="http://www.w3.org/2000/svg"
  {...rest}
>
  <path d={shape.path} fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" />
</svg>
