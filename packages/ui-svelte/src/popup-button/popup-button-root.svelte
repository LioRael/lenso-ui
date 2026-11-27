<script lang="ts">
  import { popupButtonStyles } from "@lenso/tokens/popup-button";
  import type { ComponentProps } from "svelte";
  import { Button as Part } from "@ui-sdk/svelte/button";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(popupButtonStyles.root, xstyle, className, style));
</script>

<Part data-lenso-slot="popup-button" {...rest} {...presentation} />
