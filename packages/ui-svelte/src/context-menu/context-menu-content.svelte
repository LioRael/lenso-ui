<script lang="ts" generics="Payload = unknown">
  import { contextMenuStyles } from "@lenso/tokens/context-menu";
  import { menuStyles } from "@lenso/tokens/menu";
  import { materialStyles } from "@lenso/tokens/materials";
  import { getCompact } from "./context.js";
  import { IconChevronRight } from "../icons/index.js";
  import { Menu } from "../menu/index.js";
  import type { Snippet, ComponentProps } from "svelte";
  import { MenuContent as Part } from "@ui-sdk/svelte/menu";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  type Props<Payload = unknown> = ComponentProps<typeof Part<Payload>> &
    StyleXProps & {
      preview?: Snippet;
      bar?: Snippet;
      layout?: "vertical" | "horizontal";
      previewAlign?: "leading" | "trailing";
      dim?: boolean;
    };
  const compact = getCompact();
  let {
    preview,
    bar,
    layout,
    previewAlign,
    dim = true,
    children: content,
    xstyle,
    class: className,
    style,
    ...rest
  }: Props<Payload> = $props();
  const presentation = $derived(
    styled(
      [
        contextMenuStyles.host,
        dim && contextMenuStyles.dimmed,
        previewAlign === "trailing" && contextMenuStyles.trailing,
        layout === "horizontal" &&
          (previewAlign === "trailing"
            ? contextMenuStyles.horizontalTrailing
            : contextMenuStyles.horizontal),
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part align="start" data-lenso-slot="context-menu-content" {...rest} {...presentation}>
  {#snippet children(state)}
    {@render preview?.()}
    <div
      data-lenso-slot="menu-popup"
      data-open={state.open ? "" : undefined}
      {...attributes(
        materialStyles.root,
        materialStyles.accessible,
        materialStyles.blur,
        menuStyles.content,
        contextMenuStyles.panel,
        contextMenuStyles.popup,
        compact?.active() && bar && contextMenuStyles.compactPopup,
      )}
    >
      {#if bar && compact?.active()}<div {...attributes(contextMenuStyles.bar)}>
          {@render bar()}<Menu.Item
            closeOnSelect={false}
            aria-label="More actions"
            onSelect={() => compact?.expand()}
          >
            <IconChevronRight />
          </Menu.Item>
        </div>
      {:else}{@render content?.(state)}{/if}
    </div>
  {/snippet}
</Part>
