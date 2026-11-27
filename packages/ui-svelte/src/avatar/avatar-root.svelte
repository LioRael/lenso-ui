<script lang="ts">
  import { avatarStyles, avatarSizes } from "@lenso/tokens/avatar";
  import type { ComponentProps } from "svelte";
  import { Avatar as Part } from "@ui-sdk/svelte/avatar";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { size?: keyof typeof avatarSizes; variant?: "default" | "soft" };
  let { size, variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [avatarStyles.root, avatarSizes[size ?? "md"], variant === "soft" && avatarStyles.soft],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="avatar" {...rest} {...presentation} />
