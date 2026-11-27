<script lang="ts">
  import { searchFieldGroupStyles } from "@lenso/tokens/search-field";
  import type { ComponentProps } from "svelte";
  import { InputGroup as Part } from "@ui-sdk/svelte/input";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { variant?: "primary" | "secondary"; fullWidth?: boolean };
  let { variant, fullWidth, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        searchFieldGroupStyles.root,
        variant === "secondary" && searchFieldGroupStyles.secondary,
        fullWidth && searchFieldGroupStyles.fullWidth,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="search-field" {...rest} {...presentation} />
