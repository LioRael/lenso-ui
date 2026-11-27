<script module lang="ts">
  export type GlassButtonProps = ComponentProps<typeof Button> &
    StyleXProps &
    GlassButtonAppearance & {
      elastic?: boolean;
      destructive?: boolean;
    };
</script>

<script lang="ts">
  import { glassButtonStyles } from "@lenso/tokens/glass-button";
  import { liquidMaterialStyles } from "@lenso/tokens/materials";
  import { Button } from "@ui-sdk/svelte/button";
  import type { ComponentProps } from "svelte";
  import { glassAttachment } from "../glass/attachment.svelte.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { glassButtonAppearance, type GlassButtonAppearance } from "./appearance.js";

  import { getButtonGroup } from "../button-group/context.js";
  import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
  const context = getButtonGroup();
  const group = $derived(context?.());
  let {
    size,
    variant,
    tint,
    fullWidth,
    isIconOnly,
    elastic,
    destructive,
    children: content,
    xstyle,
    class: className,
    style,
    ...rest
  }: GlassButtonProps = $props();
  const glass = glassAttachment({
    elastic: () => !rest.disabled && !group?.disabled && elastic !== false,
  });
  const presentation = $derived(
    styled(
      [
        glassButtonAppearance({
          size: size ?? group?.size,
          variant: variant ?? (group?.variant === "prominent" ? "prominent" : "default"),
          tint: tint ?? group?.tint,
          fullWidth: fullWidth ?? group?.fullWidth,
          isIconOnly,
        }),
        (destructive ?? group?.destructive) && glassButtonStyles.destructive,
        group?.orientation && !group.isDetached && buttonGroupItemStyles[group.orientation],
        group?.fullWidth && buttonGroupItemStyles.stretch,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Button
  data-lenso-slot="glass-button"
  data-glass="true"
  data-icon={isIconOnly ? "only" : undefined}
  {...rest}
  data-lenso-group-item={group ? "" : undefined}
  disabled={rest.disabled || group?.disabled}
  {...presentation}
  {...glass}
>
  {#snippet children(state)}
    <span
      data-lenso-slot="glass-button-press-highlight"
      aria-hidden="true"
      {...attributes(liquidMaterialStyles.pressHighlight)}
    ></span>
    {@render content?.(state)}
  {/snippet}
</Button>
