<script module lang="ts">
  export type ToastRootProps = ComponentProps<typeof Part> &
    StyleXProps & { variant?: ToastVariant };
</script>

<script lang="ts">
  import { bindPillSize, createPillTransition } from "@lenso/glass/motion";
  import { materialStyles } from "@lenso/tokens/materials";
  import { toastStyles as s } from "@lenso/tokens/toast";
  import { Toast as Part } from "@ui-sdk/svelte/toast";
  import type { ComponentProps } from "svelte";
  import MaterialBackground from "../glass/material-background.svelte";
  import { attributes, styled, type StyleXProps } from "../styled.js";
  import {
    getToastData,
    setToastAppearance,
    type ToastTone,
    type ToastVariant,
  } from "./context.js";

  let {
    variant = "glass",
    children: content,
    xstyle,
    class: className,
    style,
    ...rest
  }: ToastRootProps = $props();
  const read = getToastData();
  const data = $derived(read?.());
  const pill = $derived(variant === "pill");
  const glass = $derived(pill || variant === "glass");
  const material = $derived(pill ? "glass-medium" : "glass-small");
  const appearance = $derived(glass ? (data?.type === "error" ? "danger" : data?.type) : variant);
  const tone: ToastTone = $derived(
    appearance === "accent" ||
      appearance === "success" ||
      appearance === "warning" ||
      appearance === "danger"
      ? appearance
      : "default",
  );
  setToastAppearance({ pill: () => pill, tone: () => tone });

  let measure: HTMLDivElement | undefined = $state();
  let previous: HTMLDivElement | undefined = $state();
  let size = $state.raw<ReturnType<typeof bindPillSize>>();
  let transition = $state.raw<ReturnType<typeof createPillTransition>>();
  $effect(() => {
    if (!pill || !measure || !previous) return;
    const sizing = bindPillSize(measure);
    const swapping = createPillTransition(measure, previous);
    size = sizing;
    transition = swapping;
    return () => {
      sizing?.destroy();
      swapping.destroy();
      size = undefined;
      transition = undefined;
    };
  });
  $effect(() => {
    const revision = data?.version;
    size?.resize();
    if (revision !== undefined) transition?.update(data?.type);
  });
  const presentation = $derived(
    styled(
      [
        glass && materialStyles.root,
        s.root,
        glass && s.glass,
        pill && s.pill,
        glass && materialStyles.accessible,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<Part
  data-lenso-slot="toast"
  {...rest}
  {...presentation}
  data-variant={variant}
  data-tone={tone}
  data-material={glass ? material : undefined}
>
  {#snippet children(state)}
    {#if glass}<MaterialBackground profile={material} liveGeometry={pill} />{/if}
    {#if pill}
      <div {...attributes(s.pillClip)}>
        <div
          bind:this={measure}
          data-lenso-slot="toast-pill-measure"
          {...attributes(s.pillMeasure)}
        >
          {@render content?.(state)}
        </div>
        <div bind:this={previous} aria-hidden="true" inert {...attributes(s.pillPrevious)}></div>
      </div>
    {:else}
      {@render content?.(state)}
    {/if}
  {/snippet}
</Part>
