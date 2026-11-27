<script lang="ts">
  import { colorPickerStyles } from "@lenso/tokens/color-picker";
  import type { ComponentProps } from "svelte";
  import { ColorPicker as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  import { Popover } from "@ui-sdk/svelte/popover";
  type Props = Pick<
    ComponentProps<typeof Popover>,
    "open" | "defaultOpen" | "onOpenChange" | "modal"
  > &
    ComponentProps<typeof Part> &
    StyleXProps;
  let {
    open = $bindable(),
    defaultOpen,
    onOpenChange,
    modal,
    value = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  const presentation = $derived(styled(colorPickerStyles.root, xstyle, className, style));
</script>

<Popover bind:open {defaultOpen} {onOpenChange} {modal}>
  <Part data-lenso-slot="color-picker" {...rest} {...presentation} bind:value />
</Popover>
