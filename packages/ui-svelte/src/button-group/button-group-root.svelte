<script lang="ts">
  import { buttonGroupStyles } from "@lenso/tokens/button-group";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { attachFusion, type FusionGroup } from "@lenso/glass/fusion";
  import { glassContainerStyles } from "@lenso/tokens/glass-container";
  import { setFusion } from "../glass/attachment.svelte.js";
  import { attributes, styled, type StyleXProps } from "../styled.js";

  import { setButtonGroup, type GroupOptions } from "./context.js";
  let {
    orientation = "horizontal",
    disabled,
    size,
    variant,
    destructive,
    tint,
    fullWidth,
    isDetached,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: Omit<SvelteHTMLElements["fieldset"], keyof GroupOptions> &
    StyleXProps &
    GroupOptions = $props();
  setButtonGroup(() => ({
    orientation,
    disabled,
    size,
    variant,
    destructive,
    tint,
    fullWidth,
    isDetached,
  }));
  let host: HTMLFieldSetElement | undefined = $state();
  let surface: HTMLDivElement | undefined = $state();
  const fusion: FusionGroup = { members: new Set(), update: () => {} };
  setFusion(() => (isDetached ? undefined : fusion));
  $effect(() => {
    if (host && surface && !isDetached) return attachFusion(host, surface, fusion, 18);
  });
  const presentation = $derived(
    styled(
      [
        glassContainerStyles.root,
        buttonGroupStyles.root,
        buttonGroupStyles[orientation ?? "horizontal"],
        fullWidth && buttonGroupStyles.fullWidth,
        isDetached && buttonGroupStyles.detached,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<fieldset
  bind:this={host}
  data-lenso-glass-group={isDetached ? undefined : ""}
  {disabled}
  data-lenso-slot="button-group"
  {...rest}
  {...presentation}
>
  {@render children?.()}
  <div
    bind:this={surface}
    {...attributes(glassContainerStyles.surface)}
    data-lenso-glass-fusion=""
    aria-hidden="true"
    hidden
  >
    <div {...attributes(glassContainerStyles.rim)}></div>
  </div>
</fieldset>
