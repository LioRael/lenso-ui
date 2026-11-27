<!-- Keyboard behavior adapted from onlymoein/liquidglass, MIT.
     Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz. -->
<script module lang="ts">
  export type PageControlProps = Omit<SvelteHTMLElements["nav"], "children"> &
    StyleXProps & {
      count: number;
      page?: number;
      defaultPage?: number;
      onPageChange?: (page: number) => void;
      getPageLabel?: (page: number, count: number) => string;
      disabled?: boolean;
      variant?: "prominent" | "plain";
    };
</script>

<script lang="ts">
  import { pageControlStyles as s } from "@lenso/tokens/page-control";
  import { isRTL } from "@ui-sdk/core";
  import { Button } from "@ui-sdk/svelte/button";
  import { tick, untrack } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { Glass } from "../glass/index.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  let {
    count,
    page,
    defaultPage,
    onPageChange,
    getPageLabel = (index, total) => `Page ${index + 1} of ${total}`,
    disabled,
    variant = "prominent",
    onkeydown,
    xstyle,
    class: className,
    style,
    ...rest
  }: PageControlProps = $props();

  let localPage = $state(untrack(() => defaultPage ?? 0));
  const buttons = new Map<number, HTMLButtonElement>();
  const buttonKey = createAttachmentKey();
  const total = $derived(Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0);
  const current = $derived(clamp(page ?? localPage));
  const visible = $derived(Math.min(total, 9));
  const start = $derived(Math.max(0, Math.min(current - 4, total - visible)));
  const pages = $derived(Array.from({ length: visible }, (_, index) => start + index));
  const presentation = $derived(styled(s.root, xstyle, className, style));

  function clamp(index: number) {
    return Math.max(0, Math.min(total - 1, Number.isFinite(index) ? Math.trunc(index) : 0));
  }

  function select(index: number) {
    if (index === current) return;
    if (page === undefined) localPage = index;
    onPageChange?.(index);
  }

  async function keydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
    onkeydown?.(event);
    if (
      event.defaultPrevented ||
      disabled ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    const focused = [...buttons].find(([, button]) => button === event.target)?.[0];
    if (focused === undefined) return;

    const forward = isRTL(event.currentTarget) ? -1 : 1;
    const next: Record<string, number> = {
      ArrowLeft: focused - forward,
      ArrowRight: focused + forward,
      ArrowUp: focused - 1,
      ArrowDown: focused + 1,
      Home: 0,
      End: total - 1,
    };
    const index = next[event.key];
    if (index === undefined) return;
    event.preventDefault();
    const target = clamp(index);
    select(target);
    await tick();
    if (current === target) buttons.get(target)?.focus();
  }
</script>

{#snippet dots()}
  {#each pages as index (index)}
    {@const offset = index - start}
    {@const overflow =
      index !== current &&
      ((offset === 0 && start > 0) || (offset === visible - 1 && index < total - 1))}
    <Button
      {...{
        [buttonKey](node: HTMLButtonElement) {
          buttons.set(index, node);
          return () => {
            buttons.delete(index);
          };
        },
      }}
      tabindex={index === current ? 0 : -1}
      {disabled}
      aria-current={index === current ? "page" : undefined}
      aria-label={getPageLabel(index, total)}
      {...attributes(
        s.button,
        total === 7 && s.sevenButton,
        visible === 9 && (offset === 0 || offset === 8) && s.edgeButton,
      )}
      onclick={() => select(index)}
    >
      <span
        aria-hidden="true"
        {...attributes(s.dot, index === current && s.active, overflow && s.overflow)}
      ></span>
    </Button>
  {/each}
{/snippet}

{#if total}
  <nav
    aria-label="Pages"
    data-lenso-slot="page-control"
    {...rest}
    {...presentation}
    data-variant={variant}
    onkeydown={keydown}
  >
    {#if variant === "plain"}
      <div
        data-lenso-slot="page-control-track"
        {...attributes(s.track, s.plainTrack, total === 7 && s.sevenTrack)}
      >
        {@render dots()}
      </div>
    {:else}
      <Glass
        xstyle={[s.track, total === 7 && s.sevenTrack]}
        data-material="glass-small"
        data-lenso-slot="page-control-track"
      >
        {@render dots()}
      </Glass>
    {/if}
  </nav>
{/if}
