<script module lang="ts">
  export type GlassToggleButtonProps = ComponentProps<typeof Toggle> &
    StyleXProps &
    GlassButtonAppearance & { elastic?: boolean };
</script>

<script lang="ts">
  import { toggleButtonStyles } from "@lenso/tokens/toggle-button";
  import { Toggle } from "@ui-sdk/svelte/toggle";
  import type { ComponentProps } from "svelte";
  import { glassAttachment } from "../glass/attachment.svelte.js";
  import { glassButtonAppearance, type GlassButtonAppearance } from "../glass-button/appearance.js";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    size,
    variant,
    tint,
    fullWidth,
    isIconOnly,
    elastic,
    pressed = $bindable(),
    xstyle,
    class: className,
    style,
    ...rest
  }: GlassToggleButtonProps = $props();
  const glass = glassAttachment({ elastic: () => !rest.disabled && elastic !== false });
  const presentation = $derived(
    styled(
      [
        glassButtonAppearance({ size, variant, tint, fullWidth, isIconOnly }),
        toggleButtonStyles.selected,
        variant === "prominent" && toggleButtonStyles.prominentSelected,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Toggle
  data-lenso-slot="glass-toggle-button"
  data-glass="true"
  data-icon={isIconOnly ? "only" : undefined}
  {...rest}
  {...presentation}
  {...glass}
  bind:pressed
/>
