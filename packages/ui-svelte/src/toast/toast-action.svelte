<script lang="ts">
  import { toastStyles } from "@lenso/tokens/toast";
  import type { ComponentProps } from "svelte";
  import { ToastAction as Part } from "@ui-sdk/svelte/toast";
  import { getToastAppearance } from "./context.js";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, ...rest }: Props = $props();
  const pill = getToastAppearance();
  const presentation = $derived(
    styled(
      [
        toastStyles.fading,
        toastStyles.action,
        pill?.pill() && toastStyles.pillControl,
        pill?.pill() && toastStyles.pillAction,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="toast-action" {...rest} {...presentation} />
