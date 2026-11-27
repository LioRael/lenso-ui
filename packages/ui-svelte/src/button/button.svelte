<script module lang="ts">
  export type ButtonProps = ComponentProps<typeof SdkButton> &
    StyleXProps & {
      size?: "sm" | "md" | "lg";
      variant?: "prominent" | "bordered" | "borderless";
      destructive?: boolean;
      fullWidth?: boolean;
      isIconOnly?: boolean;
      isLoading?: boolean;
      tint?: string;
    };
</script>

<script lang="ts">
  import {
    buttonIconOnlySizes,
    buttonSizes,
    buttonStyles,
    buttonVariants,
  } from "@lenso/tokens/button";
  import { Button as SdkButton } from "@ui-sdk/svelte/button";
  import type { ComponentProps } from "svelte";
  import { styled, type StyleXProps } from "../styled.js";

  import { getButtonGroup } from "../button-group/context.js";
  import { buttonGroupItemStyles } from "@lenso/tokens/button-group";
  const context = getButtonGroup();
  const group = $derived(context?.());
  let {
    size: ownSize,
    variant: ownVariant,
    destructive: ownDestructive,
    fullWidth: ownWidth,
    isIconOnly,
    tint: ownTint,
    disabled,
    isLoading,
    focusableWhenDisabled,
    xstyle,
    class: className,
    style,
    ...rest
  }: ButtonProps = $props();
  const size = $derived(ownSize ?? group?.size ?? "md");
  const variant = $derived(
    ownVariant ?? (group?.variant === "default" ? "bordered" : group?.variant) ?? "bordered",
  );
  const destructive = $derived(ownDestructive ?? group?.destructive);
  const fullWidth = $derived(ownWidth ?? group?.fullWidth);
  const tint = $derived(ownTint ?? group?.tint);
  const presentation = $derived(
    styled(
      [
        buttonStyles.root,
        isLoading && buttonStyles.pending,
        buttonSizes[size],
        buttonStyles.tracking,
        buttonVariants[variant],
        variant === "bordered" && (destructive || Boolean(tint)) && buttonStyles.tintedBordered,
        destructive && buttonStyles.destructiveTracking,
        destructive && size === "lg" && buttonStyles.destructiveLargeTracking,
        variant === "borderless" && size === "lg" && buttonStyles.largeBorderless,
        isIconOnly && buttonStyles.iconOnly,
        isIconOnly && buttonIconOnlySizes[size],
        group?.orientation && !group.isDetached && buttonGroupItemStyles[group.orientation],
        group?.fullWidth && buttonGroupItemStyles.stretch,
        fullWidth && buttonStyles.fullWidth,
        destructive && buttonStyles.destructive,
        tint ? buttonStyles.tint(tint) : undefined,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<SdkButton
  data-lenso-slot="button"
  data-glass="false"
  data-variant={variant}
  data-destructive={destructive ? "" : undefined}
  data-tint={tint ? "" : undefined}
  data-icon={isIconOnly ? "only" : undefined}
  {...rest}
  disabled={disabled || group?.disabled || isLoading}
  focusableWhenDisabled={focusableWhenDisabled || (isLoading && !disabled && !group?.disabled)}
  aria-busy={isLoading || rest["aria-busy"]}
  data-pending={isLoading ? "" : undefined}
  data-lenso-group-item={group ? "" : undefined}
  {...presentation}
/>
