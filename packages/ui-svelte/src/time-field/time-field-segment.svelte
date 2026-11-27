<script lang="ts">
  import { dateInputGroupStyles } from "@lenso/tokens/date-input-group";
  import type { ComponentProps } from "svelte";
  import { TimeInputSegment as Part } from "@ui-sdk/svelte/time-input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [dateInputGroupStyles.segment, dateInputGroupStyles.segmentInput],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="time-field-segment" {...rest} {...presentation} />
