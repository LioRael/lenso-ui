<script lang="ts">
  import {
    avatarStyles,
    avatarFallbackSizes,
    avatarColors,
    avatarSoft,
  } from "@lenso/tokens/avatar";
  import type { ComponentProps } from "svelte";
  import { AvatarFallback as Part } from "@ui-sdk/svelte/avatar";
  import { styled, type StyleXProps } from "../styled.js";

  let {
    size,
    color,
    variant,
    xstyle,
    class: className,
    style,
    ...rest
  }: ComponentProps<typeof Part> &
    StyleXProps & {
      size?: keyof typeof avatarFallbackSizes;
      color?: keyof typeof avatarColors;
      variant?: "default" | "soft";
    } = $props();
  const presentation = $derived(
    styled(
      [
        avatarStyles.fallback,
        avatarFallbackSizes[size ?? "md"],
        avatarColors[color ?? "default"],
        variant === "soft" && avatarSoft[color ?? "default"],
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="avatar-fallback" {...rest} {...presentation} />
