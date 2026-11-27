<script lang="ts" generics="Payload = unknown">
  import { modalStyles } from "@lenso/tokens/modal";
  import type { ComponentProps } from "svelte";
  import { DialogContent as Part } from "@ui-sdk/svelte/dialog";
  import { styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> &
    StyleXProps & {
      size?: "xs" | "sm" | "md" | "lg" | "cover" | "full";
      scroll?: "inside" | "outside";
    };
  let { size, scroll, xstyle, class: className, style, ...rest }: Props<Payload> = $props();
  const presentation = $derived(
    styled(
      [
        modalStyles.popup,
        modalStyles.nativeContent,
        modalStyles[size ?? "md"],
        modalStyles[scroll ?? "inside"],
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="modal-content" {...rest} {...presentation} />
