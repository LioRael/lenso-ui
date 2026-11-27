<script module lang="ts">
  export type CloseButtonProps = ButtonProps;
</script>

<script lang="ts">
  import { closeButtonStyles } from "@lenso/tokens/close-button";
  import { Button, type ButtonProps } from "../button/index.js";
  import CloseButtonIcon from "./close-button-icon.svelte";

  let { children: content, xstyle, ...rest }: CloseButtonProps = $props();
</script>

<Button
  aria-label="Close"
  {...rest}
  data-lenso-slot="close-button"
  xstyle={[closeButtonStyles.root, xstyle]}
>
  {#snippet children(state)}
    {#if content}
      {@render content(state)}
    {:else}
      <CloseButtonIcon viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="m4 4 8 8M12 4l-8 8"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </CloseButtonIcon>
    {/if}
  {/snippet}
</Button>
