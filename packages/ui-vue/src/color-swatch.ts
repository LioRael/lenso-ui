// Copyright NextUI Inc. Apache-2.0. Modified for Vue and native CSS colors.
import { colorSwatchStyles } from "@lenso/tokens/color-swatch";
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue";
import { partAttributes, type ComponentProps, type StyledPart } from "./parts.js";

const Swatch = defineComponent({
  name: "LensoColorSwatch",
  inheritAttrs: false,
  props: {
    color: { type: String, default: "#ff0000" },
    colorName: String,
    size: { type: String as PropType<"xs" | "sm" | "md" | "lg" | "xl">, default: "md" },
    shape: String as PropType<"circle" | "square">,
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "div",
        partAttributes(
          "color-swatch",
          [
            colorSwatchStyles.root,
            colorSwatchStyles[props.size],
            props.shape === "square" && colorSwatchStyles.square,
          ],
          {
            role: "img",
            "aria-label": props.colorName ?? props.color,
            ...attrs,
            style: [
              {
                background: `linear-gradient(${props.color},${props.color}),var(--lenso-color-checkerboard) 50% / 16px 16px`,
              },
              attrs["style"],
            ],
          },
        ),
        slots["default"]?.(),
      );
  },
});
export const ColorSwatchRoot = Swatch as unknown as StyledPart<typeof Swatch, HTMLAttributes>;
export type ColorSwatchProps = ComponentProps<typeof ColorSwatchRoot>;
export const ColorSwatch: typeof ColorSwatchRoot & { Root: typeof ColorSwatchRoot } = Object.assign(
  ColorSwatchRoot,
  { Root: ColorSwatchRoot },
);
