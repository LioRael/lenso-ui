<!-- Magnifier adaptation. Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT. -->
<script module lang="ts">
  export type GlassMagnifierProps = Omit<GlassProps, "draggable"> & {
    draggable?: boolean;
    animated?: boolean;
  };
</script>

<script lang="ts">
  import { glassMotion } from "@lenso/glass/motion";
  import { glassMagnifierStyles } from "@lenso/tokens/glass-magnifier";
  import { createAttachmentKey } from "svelte/attachments";
  import { Glass, type GlassProps } from "../glass/index.js";

  let { draggable = true, animated = true, xstyle, ...rest }: GlassMagnifierProps = $props();
  const motion = {
    [createAttachmentKey()]: (element: HTMLDivElement) => glassMotion(element, draggable, animated),
  };
</script>

<Glass
  data-lenso-slot="glass-magnifier"
  {...rest}
  {...motion}
  xstyle={[glassMagnifierStyles.root, draggable && glassMagnifierStyles.draggable, xstyle]}
/>
