<script lang="ts">
  import { toggleButtonGroupStyles } from "@lenso/tokens/toggle-button-group";
  import type { ComponentProps } from "svelte";
  import { ToggleGroup as Part } from "@ui-sdk/svelte/toggle";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { value = $bindable(), xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        toggleButtonGroupStyles.root,
        rest.orientation === "vertical"
          ? toggleButtonGroupStyles.vertical
          : toggleButtonGroupStyles.horizontal,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="toggle-button-group" {...rest} {...presentation} bind:value />
