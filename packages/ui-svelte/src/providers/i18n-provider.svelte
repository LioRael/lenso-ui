<script lang="ts">
  import type { Snippet } from "svelte";
  import { isRTL, setLocale } from "./locale.js";
  let { locale, children }: { locale: string; children?: Snippet } = $props();
  setLocale(() => locale);
</script>

<div lang={locale} dir={isRTL(locale) ? "rtl" : "ltr"} style="display:contents">
  {@render children?.()}
</div>
