<script lang="ts">
  import { selectStyles } from "@lenso/tokens/select";
  import { popupButtonStyles } from "@lenso/tokens/popup-button";
  import type { ComponentProps } from "svelte";
  import { SelectTrigger as Part } from "@ui-sdk/svelte/select";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps & { variant?: "primary" | "secondary" };
  let { variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled(
      [
        popupButtonStyles.root,
        selectStyles.validation,
        variant === "secondary" && selectStyles.secondary,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="select-trigger" {...rest} {...presentation} />
