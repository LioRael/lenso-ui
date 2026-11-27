// Copyright (c) 2026 Kelvin Zhang. SPDX-License-Identifier: MIT.
// Modified: bind shared optics and motion to the Vue element lifetime.
import { attachGlass } from "@lenso/glass";
import { glassIsOpaque, observeGlassPreferences, type FusionGroup } from "@lenso/glass/fusion";
import { bindPress, bindPressHighlight } from "@lenso/glass/motion";
import { glassStyles } from "@lenso/tokens/glass";
import {
  defineComponent,
  h,
  inject,
  shallowRef,
  watchPostEffect,
  type HTMLAttributes,
  type InjectionKey,
} from "vue";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

export const GlassFusionContext: InjectionKey<() => FusionGroup | undefined> =
  Symbol("GlassFusion");

export function useGlassElement(elastic: () => boolean, enabled: () => boolean = () => true) {
  const element = shallowRef<HTMLElement>();
  const fusion = inject(GlassFusionContext, () => undefined);
  watchPostEffect((cleanup) => {
    const node = element.value;
    if (!node || !enabled()) return;
    const group = fusion();
    const stopOptics = attachGlass(node, { profileKey: "glass-small" });
    const stopHighlight = bindPressHighlight(node);
    const sync = () => {
      if (!group) return;
      if (glassIsOpaque(node)) group.members.delete(node);
      else group.members.add(node);
      group.update();
    };
    const canFuse = group && !node.hasAttribute("popover") && node.tagName !== "DIALOG";
    const stopPreferences = canFuse ? observeGlassPreferences(node, sync) : undefined;
    if (canFuse) sync();
    cleanup(() => {
      stopPreferences?.();
      if (canFuse) {
        group.members.delete(node);
        group.update();
      }
      stopHighlight();
      stopOptics();
    });
  });
  watchPostEffect((cleanup) => {
    if (element.value && elastic()) cleanup(bindPress(element.value));
  });
  return element;
}

const Surface = defineComponent({
  name: "LensoGlass",
  inheritAttrs: false,
  props: { elastic: Boolean },
  setup(props, { attrs, slots }) {
    const element = useGlassElement(() => props.elastic);
    return () =>
      h(
        "div",
        {
          ...partAttributes(
            "glass",
            [
              glassStyles.root,
              glassStyles.optics,
              glassStyles.foreground,
              glassStyles.hotspot,
              props.elastic && glassStyles.elastic,
            ],
            attrs,
          ),
          ref: element,
        },
        slots["default"]?.(),
      );
  },
});
export const Glass: StyledPart<typeof Surface, HTMLAttributes> = Surface as unknown as StyledPart<
  typeof Surface,
  HTMLAttributes
>;
export type GlassProps = ComponentProps<typeof Glass>;
