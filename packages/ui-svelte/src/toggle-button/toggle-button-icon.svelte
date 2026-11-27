<script lang="ts">
  import { buttonStyles } from "@lenso/tokens/button";
  import type { ComponentProps } from "svelte";
  import { ToggleIcon as Part } from "@ui-sdk/svelte/toggle";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(buttonStyles.icon, xstyle, className, style));
</script>

<Part data-lenso-slot="toggle-button-icon" {...rest} {...presentation} />
