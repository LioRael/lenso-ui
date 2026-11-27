<script module lang="ts">
  export type ThemeScopeProps = SvelteHTMLElements["div"] &
    StyleXProps & {
      theme?: "light" | "dark";
      contrast?: "standard" | "increased";
      level?: "base" | "elevated";
      glassTint?: number;
      glassTransparency?: number;
    };
</script>

<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  let {
    theme,
    contrast,
    level,
    glassTint,
    glassTransparency,
    xstyle,
    class: className,
    style,
    children,
    ...rest
  }: ThemeScopeProps = $props();
  const amount = (n: number | undefined, fallback: number) =>
    n === undefined ? undefined : Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : fallback;
  const presentation = $derived(styled(undefined, xstyle, className, style));
</script>

<div
  data-lenso-slot="theme-scope"
  {...rest}
  {...presentation}
  data-theme={theme ?? rest["data-theme"]}
  data-contrast={contrast ?? rest["data-contrast"]}
  data-level={level ?? rest["data-level"]}
  style:--lenso-glass-tint-amount={amount(glassTint, 0.5)}
  style:--lenso-glass-transparency={amount(glassTransparency, 1)}
>
  {@render children?.()}
</div>
