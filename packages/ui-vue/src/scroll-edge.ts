import {
  bindScrollEdge,
  softEdgeBands,
  softEdgeMask,
  createSoftEdgeTintMask,
  type ScrollEdgeSide,
} from "@lenso/glass/motion";
import { materialStyles as styles } from "@lenso/tokens/materials";
import * as stylex from "@stylexjs/stylex";
import {
  defineComponent,
  h,
  shallowRef,
  watchPostEffect,
  type HTMLAttributes,
  type PropType,
} from "vue";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

const hardSides = {
  top: styles.hardTop,
  bottom: styles.hardBottom,
  "inline-start": styles.hardInlineStart,
  "inline-end": styles.hardInlineEnd,
};

const Edge = defineComponent({
  name: "LensoScrollEdge",
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<"soft" | "hard">, default: "soft" },
    edge: { type: String as PropType<ScrollEdgeSide>, default: "top" },
    scrollRef: Object as PropType<HTMLElement | null>,
    fadeStart: Number,
  },
  setup(props, { attrs, slots }) {
    const node = shallowRef<HTMLElement>();
    watchPostEffect((cleanup) => {
      if (node.value && props.scrollRef)
        cleanup(bindScrollEdge(node.value, props.scrollRef, props.edge));
    });

    return () => {
      const hard = props.variant === "hard";
      return h(
        "div",
        {
          ...partAttributes(
            "scroll-edge",
            [
              styles.edge,
              hard ? styles.hard : styles.soft,
              hard && hardSides[props.edge],
              styles[props.edge],
              styles.edgeAccessible,
            ],
            {
              ...attrs,
              "aria-hidden": "true",
              "data-edge": props.edge,
              "data-variant": props.variant,
              "data-scroll-bound": props.scrollRef ? "" : undefined,
            },
          ),
          ref: node,
        },
        hard
          ? slots["default"]?.()
          : [
              ...softEdgeBands.map((band) =>
                h("span", {
                  key: band.end,
                  ...stylex.attrs(
                    styles.softLayer,
                    styles.softProgressive(
                      band.blur,
                      props.fadeStart
                        ? softEdgeMask(band.start, band.end, 1, props.fadeStart)
                        : band.mask,
                    ),
                  ),
                }),
              ),
              h(
                "span",
                stylex.attrs(
                  styles.softLayer,
                  styles.softTint,
                  styles.softMask(createSoftEdgeTintMask(props.fadeStart)),
                ),
              ),
            ],
      );
    };
  },
});

export const ScrollEdge: StyledPart<typeof Edge, HTMLAttributes> = Edge as unknown as StyledPart<
  typeof Edge,
  HTMLAttributes
>;
export type ScrollEdgeProps = ComponentProps<typeof ScrollEdge>;
