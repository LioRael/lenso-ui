<script lang="ts">
  import { modalStyles } from "@lenso/tokens/modal";
  import type { ComponentProps } from "svelte";
  import { DialogBackdrop as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props = ComponentProps<typeof Part> &
    StyleXProps & { variant?: "transparent" | "opaque" | "blur" };
  let { variant, xstyle, class: className, style, ...rest }: Props = $props();
  const presentation = $derived(
    styled([modalStyles.backdrop, modalStyles[variant ?? "opaque"]], xstyle, className, style),
  );
</script>

<Part data-lenso-slot="modal-backdrop" {...rest} {...presentation} />
