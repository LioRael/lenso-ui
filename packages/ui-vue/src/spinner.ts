import { spinnerColors, spinnerSizes, spinnerStyles } from "@lenso/tokens/spinner";
import * as stylex from "@stylexjs/stylex";
import { defineComponent, h, type PropType } from "vue";
import { htmlPart } from "./parts.js";

type Options = { size?: keyof typeof spinnerSizes; color?: keyof typeof spinnerColors };
const Root = htmlPart<"output", Options>(
  "output",
  "spinner",
  (props) => [
    spinnerStyles.root,
    spinnerSizes[props.size ?? "md"],
    spinnerColors[props.color ?? "secondary"],
  ],
  "size",
  "color",
);
export const SpinnerRoot: typeof Root = defineComponent({
  name: "LensoSpinner",
  inheritAttrs: false,
  props: { size: String as PropType<Options["size"]> },
  setup(props, { attrs }) {
    return () => {
      const small = props.size === "sm";
      const dimension = small ? 22 : 30;
      const thickness = small ? 3 : 4;
      return h(
        Root,
        { "aria-label": "Loading", ...attrs, size: props.size },
        {
          default: () =>
            h(
              "svg",
              {
                ...stylex.attrs(spinnerStyles.icon),
                "aria-hidden": "true",
                viewBox: `0 0 ${dimension} ${dimension}`,
              },
              Array.from({ length: 8 }, (_, index) =>
                h("rect", {
                  x: (dimension - thickness) / 2,
                  y: 0,
                  width: thickness,
                  height: small ? 7 : 10,
                  rx: thickness / 2,
                  fill: "currentColor",
                  opacity: 1 - index * 0.12,
                  transform: `rotate(${index * 45} ${dimension / 2} ${dimension / 2})`,
                }),
              ),
            ),
        },
      );
    };
  },
}) as unknown as typeof Root;
export const Spinner: typeof SpinnerRoot & { Root: typeof SpinnerRoot } = Object.assign(
  SpinnerRoot,
  { Root: SpinnerRoot },
);

export type SpinnerProps = import("./parts.js").ComponentProps<typeof SpinnerRoot>;
