<script lang="ts">
  import { switchStyles } from "@lenso/tokens/switch";
  import type { ComponentProps } from "svelte";
  import { Switch as Part } from "@ui-sdk/svelte/switch";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { size?: "sm" | "md" | "lg" };
  let { size, checked = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        switchStyles.root,
        size === "sm" && switchStyles.rootSm,
        size === "lg" && switchStyles.rootLg,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="switch" {...rest} {...presentation} bind:checked />
