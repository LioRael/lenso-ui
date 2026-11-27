<script lang="ts">
  import { selectStyles } from "@lenso/tokens/select";
  import { menuStyles } from "@lenso/tokens/menu";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { SelectContent as Part } from "@ui-sdk/svelte/select";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        materialStyles.blur,
        menuStyles.popup,
        selectStyles.positioner,
        selectStyles.popover,
        selectStyles.typography,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="select-content" {...rest} {...presentation} />
