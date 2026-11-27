<script lang="ts">
  import { colorSliderStyles } from "@lenso/tokens/color-slider";
  import type { ComponentProps } from "svelte";
  import { ColorPickerSlider as Part } from "@ui-sdk/svelte/color-picker";
  import { styled, type StyleXProps } from "../styled.js";

  import Channel from "./channel.svelte";
  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { children, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        colorSliderStyles.root,
        colorSliderStyles.track,
        rest.orientation === "vertical" && colorSliderStyles.verticalTrack,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

{#snippet content(state: import("@ui-sdk/svelte/color-picker").ColorPickerSliderState)}<Channel
    value={state.channelValue}
  >
    {@render children?.(state)}
  </Channel>{/snippet}
<Part
  data-lenso-slot="color-slider"
  {...rest}
  {...presentation}
  children={children ? content : undefined}
/>
