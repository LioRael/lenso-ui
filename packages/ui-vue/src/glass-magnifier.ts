// Magnifier adaptation, Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
import { glassMotion } from "@lenso/glass/motion";
import { glassMagnifierStyles } from "@lenso/tokens/glass-magnifier";
import { defineComponent, h, shallowRef, watchPostEffect, type ComponentPublicInstance } from "vue";
import { Glass, type GlassProps } from "./glass.js";
import type { StyleXArgument } from "./parts.js";

export type GlassMagnifierProps = Omit<GlassProps, "draggable"> & {
  draggable?: boolean;
  animated?: boolean;
};

export const GlassMagnifier = defineComponent({
  name: "LensoGlassMagnifier",
  inheritAttrs: false,
  props: {
    draggable: { type: Boolean, default: true },
    animated: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots }) {
    const surface = shallowRef<ComponentPublicInstance>();
    watchPostEffect((cleanup) => {
      const node = surface.value?.$el;
      if (node instanceof HTMLElement) cleanup(glassMotion(node, props.draggable, props.animated));
    });
    return () =>
      h(
        Glass,
        {
          ...attrs,
          ref: surface,
          "data-lenso-slot": String(attrs["data-lenso-slot"] ?? "glass-magnifier"),
          xstyle: [
            glassMagnifierStyles.root,
            props.draggable && glassMagnifierStyles.draggable,
            attrs["xstyle"] as StyleXArgument,
          ],
        },
        slots,
      );
  },
}) as unknown as new () => { $props: GlassMagnifierProps };
