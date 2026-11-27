<script lang="ts">
  import { listStyles as s } from "@lenso/tokens/list";
  import type { ComponentProps } from "svelte";
  import { Button as Part } from "@ui-sdk/svelte/button";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(s.handle, xstyle, className, style));
</script>

<Part data-lenso-slot="list-reorder" {...rest} {...presentation} />
