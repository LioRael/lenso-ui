<script lang="ts">
  import { toolbarStyles } from "@lenso/tokens/toolbar";
  import type { ComponentProps } from "svelte";
  import { Toolbar as Part } from "@ui-sdk/svelte/toolbar";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [toolbarStyles.root, rest.orientation === "vertical" && toolbarStyles.vertical],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="toolbar" {...rest} {...presentation} />
