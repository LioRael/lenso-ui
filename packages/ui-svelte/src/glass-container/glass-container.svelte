<script module lang="ts">
  export type GlassContainerProps = SvelteHTMLElements["div"] &
    StyleXProps & {
      tint?: string;
      spacing?: number;
      disabled?: boolean;
    };
</script>

<script lang="ts">
  import { attachFusion, type FusionGroup } from "@lenso/glass/fusion";
  import { glassContainerStyles } from "@lenso/tokens/glass-container";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { setFusion } from "../glass/attachment.svelte.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  let {
    tint,
    spacing = 20,
    disabled,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: GlassContainerProps = $props();
  let host: HTMLDivElement | undefined = $state();
  let surface: HTMLDivElement | undefined = $state();
  const group: FusionGroup = { members: new Set(), update: () => {} };
  setFusion(() => (disabled ? undefined : group));
  const presentation = $derived(
    styled(
      [glassContainerStyles.root, tint ? glassContainerStyles.tint(tint) : undefined],
      xstyle,
      className,
      style,
    ),
  );
  $effect(() => {
    if (host && surface && !disabled) {
      return attachFusion(
        host,
        surface,
        group,
        Number.isFinite(spacing) ? Math.max(0, spacing) : 20,
      );
    }
  });
</script>

<div data-lenso-slot="glass-container" {...rest} {...presentation} bind:this={host}>
  {@render children?.()}
  <div
    {...attributes(glassContainerStyles.surface)}
    data-lenso-glass-fusion=""
    aria-hidden="true"
    hidden
    bind:this={surface}
  >
    <div {...attributes(glassContainerStyles.rim)}></div>
  </div>
</div>
