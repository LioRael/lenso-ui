<script lang="ts">
  import { datePickerStyles } from "@lenso/tokens/date-picker";
  import { materialStyles } from "@lenso/tokens/materials";
  import type { ComponentProps } from "svelte";
  import { DatePickerContent as Part } from "@ui-sdk/svelte/date-picker";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        materialStyles.root,
        materialStyles.accessible,
        materialStyles.blur,
        datePickerStyles.popover,
        datePickerStyles.scroller,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="date-picker-content" {...rest} {...presentation} />
