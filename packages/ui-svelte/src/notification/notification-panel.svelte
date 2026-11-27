<script lang="ts">
  import { notificationStyles } from "@lenso/tokens/notification";
  import type { ComponentProps } from "svelte";
  import { CollapsiblePanel as Part } from "@ui-sdk/svelte/collapsible";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(notificationStyles.panel, xstyle, className, style));
</script>

<Part data-lenso-slot="notification-panel" {...rest} {...presentation} />
