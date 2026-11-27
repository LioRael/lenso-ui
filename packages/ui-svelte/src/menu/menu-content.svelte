<script lang="ts" generics="Payload = unknown">
  import { menuStyles } from "@lenso/tokens/menu";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { MenuContent as Part } from "@ui-sdk/svelte/menu";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        materialStyles.blur,
        menuStyles.positioner,
        menuStyles.popup,
        menuStyles.content,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="menu-content" {...rest} {...presentation} />
