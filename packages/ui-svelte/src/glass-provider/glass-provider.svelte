<script module lang="ts">
  export type GlassProviderProps = {
    children?: Snippet;
    tint?: number;
    defaultTint?: number;
    onTintChange?: (value: number) => void;
  };
</script>

<script lang="ts">
  import { materialStyles } from "@lenso/tokens/materials";
  import type { Snippet } from "svelte";
  import { untrack } from "svelte";
  import ThemeScope from "../providers/theme-scope.svelte";
  import { setPreferences } from "./context.js";
  const normalize = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0.5);
  let { children, tint, defaultTint = 0.5, onTintChange }: GlassProviderProps = $props();
  let local = $state(untrack(() => normalize(defaultTint)));
  const current = $derived(normalize(tint ?? local));
  setPreferences({
    get tint() {
      return current;
    },
    setTint(value) {
      const next = normalize(value);
      if (tint === undefined) local = next;
      onTintChange?.(next);
    },
  });
</script>

<ThemeScope glassTint={current} xstyle={materialStyles.provider}>{@render children?.()}</ThemeScope>
