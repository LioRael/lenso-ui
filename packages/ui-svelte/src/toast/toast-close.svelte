<script lang="ts">
  import { closeButtonStyles } from "@lenso/tokens/close-button";
  import { toastStyles as s } from "@lenso/tokens/toast";
  import { ToastClose as Part } from "@ui-sdk/svelte/toast";
  import type { ComponentProps } from "svelte";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import { getToastAppearance } from "./context.js";

  type Props = ComponentProps<typeof Part> & StyleXProps;
  let { xstyle, class: className, style, children: content, ...rest }: Props = $props();
  const appearance = getToastAppearance();
  const presentation = $derived(
    styled(
      [
        closeButtonStyles.root,
        s.close,
        appearance?.pill() && s.pillControl,
        appearance?.pill() && s.pillClose,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part data-lenso-slot="toast-close" aria-label="Close" {...rest} {...presentation}>
  {#snippet children(state)}
    {#if content}
      {@render content(state)}
    {:else}
      <svg {...attributes(s.closeIcon)} aria-hidden="true" viewBox="0 0 16 16" fill="none">
        <path
          d="m4 4 8 8M12 4l-8 8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    {/if}
  {/snippet}
</Part>
