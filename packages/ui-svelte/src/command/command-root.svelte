<script lang="ts">
  import { commandStyles } from "@lenso/tokens/command";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { Command as Part } from "@ui-sdk/svelte/command";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let {
    value = $bindable(),
    query = $bindable(),
    pages = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  const presentation = $derived(
    styled(
      [materialStyles.root, materialStyles.accessible, commandStyles.root],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="command" {...rest} {...presentation} bind:value bind:query bind:pages />
