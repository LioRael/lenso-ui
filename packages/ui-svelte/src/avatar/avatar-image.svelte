<script lang="ts">
  import { avatarStyles } from "@lenso/tokens/avatar";
  import type { ComponentProps } from "svelte";
  import { AvatarImage as Part } from "@ui-sdk/svelte/avatar";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(styled(avatarStyles.image, xstyle, className, style));
</script>

<Part data-lenso-slot="avatar-image" {...rest} {...presentation} />
