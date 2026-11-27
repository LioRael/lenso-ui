<script lang="ts">
  import { datePickerStyles } from "@lenso/tokens/date-picker";
  import type { ComponentProps } from "svelte";
  import { DatePicker as Part } from "@ui-sdk/svelte/date-picker";
  import { styled, type StyleXProps } from "../styled.js";

  import { setController } from "./context.js";
  import { createDatePickerController } from "@ui-sdk/svelte/date-picker";
  type Props = ComponentProps<typeof Part> & StyleXProps;
  let {
    controller,
    value = $bindable(),
    open = $bindable(),
    month = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: Props = $props();
  const own = createDatePickerController();
  setController(() => controller ?? own);
  const presentation = $derived(styled(datePickerStyles.root, xstyle, className, style));
</script>

<Part
  data-lenso-slot="date-picker"
  {...rest}
  {...presentation}
  controller={controller ?? own}
  bind:value
  bind:open
  bind:month
/>
