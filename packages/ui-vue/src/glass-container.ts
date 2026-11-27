import { attachFusion, type FusionGroup } from "@lenso/glass/fusion";
import { glassContainerStyles } from "@lenso/tokens/glass-container";
import * as stylex from "@stylexjs/stylex";
import { defineComponent, h, provide, shallowRef, watchPostEffect, type HTMLAttributes } from "vue";
import { Glass, GlassFusionContext } from "./glass.js";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

export function useGlassFusion(enabled: () => boolean, spacing: () => number) {
  const element = shallowRef<HTMLElement>();
  const surface = shallowRef<HTMLDivElement>();
  const group: FusionGroup = { members: new Set(), update: () => {} };
  provide(GlassFusionContext, () => (enabled() ? group : undefined));
  watchPostEffect((cleanup) => {
    if (element.value && surface.value && enabled()) {
      const gap = spacing();
      cleanup(
        attachFusion(
          element.value,
          surface.value,
          group,
          Number.isFinite(gap) ? Math.max(0, gap) : 20,
        ),
      );
    }
  });
  return {
    element,
    paint: () =>
      h(
        "div",
        {
          ...stylex.attrs(glassContainerStyles.surface),
          ref: surface,
          "data-lenso-glass-fusion": "",
          "aria-hidden": "true",
          hidden: true,
        },
        [h("div", stylex.attrs(glassContainerStyles.rim))],
      ),
  };
}

const Container = defineComponent({
  name: "LensoGlassContainer",
  inheritAttrs: false,
  props: { tint: String, spacing: { type: Number, default: 20 }, disabled: Boolean },
  setup(props, { attrs, slots }) {
    const { element, paint } = useGlassFusion(
      () => !props.disabled,
      () => props.spacing,
    );
    return () =>
      h(
        "div",
        {
          ...partAttributes(
            "glass-container",
            [glassContainerStyles.root, props.tint ? glassContainerStyles.tint(props.tint) : false],
            attrs,
          ),
          ref: element,
        },
        [slots["default"]?.(), paint()],
      );
  },
});
const Root: StyledPart<typeof Container, HTMLAttributes> = Container as unknown as StyledPart<
  typeof Container,
  HTMLAttributes
>;
export type GlassContainerProps = ComponentProps<typeof Root>;
export const GlassContainer: typeof Root & { Item: typeof Glass } = Object.assign(Root, {
  Item: Glass,
});
