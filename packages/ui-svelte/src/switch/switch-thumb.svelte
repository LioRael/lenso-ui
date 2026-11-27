<script lang="ts">
  import { switchStyles } from "@lenso/tokens/switch";
  import type { ComponentProps } from "svelte";
  import { SwitchThumb as Part } from "@ui-sdk/svelte/switch";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(switchStyles.thumb, xstyle, className, style));
</script>

<Part data-lenso-slot="switch-thumb" {...rest} {...presentation} />
