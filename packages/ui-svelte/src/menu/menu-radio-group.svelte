<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { MenuRadioGroup as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(undefined, xstyle, className, style));
</script>

<Part data-lenso-slot="menu-radio-group" {...rest} {...presentation} bind:value />
