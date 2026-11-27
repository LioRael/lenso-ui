<!-- Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
     Modified to bind shared optics and motion to the Svelte element lifetime. -->
<script module lang="ts">
  export type GlassProps = SvelteHTMLElements["div"] & StyleXProps & { elastic?: boolean };
</script>

<script lang="ts">
  import { glassStyles } from "@lenso/tokens/glass";
  import type { SvelteHTMLElements } from "svelte/elements";
  import { styled, type StyleXProps } from "../styled.js";
  import { glassAttachment } from "./attachment.svelte.js";

  let { elastic, xstyle, class: className, style, children, ...rest }: GlassProps = $props();
  const glass = glassAttachment({ elastic: () => Boolean(elastic) });
  const presentation = $derived(
    styled(
      [
        glassStyles.root,
        glassStyles.optics,
        glassStyles.foreground,
        glassStyles.hotspot,
        elastic && glassStyles.elastic,
      ],
      xstyle,
      className,
      style,
    ),
  );
</script>

<div data-lenso-slot="glass" {...rest} {...presentation} {...glass}>
  {@render children?.()}
</div>
