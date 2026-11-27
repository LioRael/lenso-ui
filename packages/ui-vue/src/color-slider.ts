import { colorSliderStyles } from "@lenso/tokens/color-slider";
import {
  ColorPickerSlider as SdkRoot,
  ColorPickerSliderThumb as SdkThumb,
  type ColorPickerSliderState,
} from "@ui-sdk/vue/color-picker";
import { defineComponent, h, inject, provide, type InjectionKey, type PropType } from "vue";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

const Slider: StyledPart<typeof SdkRoot> = sdkPart(SdkRoot, "color-slider", (props) => [
  colorSliderStyles.root,
  colorSliderStyles.track,
  props.orientation === "vertical" && colorSliderStyles.verticalTrack,
]);
export const ColorSliderThumb: StyledPart<typeof SdkThumb> = sdkPart(
  SdkThumb,
  "color-slider-thumb",
  () => colorSliderStyles.thumb,
);
export const ColorSliderLabel = htmlPart(
  "label",
  "color-slider-label",
  () => colorSliderStyles.label,
);
export const ColorSliderTrack = htmlPart(
  "div",
  "color-slider-track",
  () => colorSliderStyles.track,
);
const Channel: InjectionKey<() => number> = Symbol("ColorSliderChannel");
const Values = defineComponent({
  props: { state: { type: Object as PropType<ColorPickerSliderState>, required: true } },
  setup(props, { slots }) {
    provide(Channel, () => props.state.channelValue);
    return () => slots["default"]?.();
  },
});
export const ColorSliderRoot: typeof Slider = defineComponent({
  name: "LensoColorSlider",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(Slider, attrs, {
        ...slots,
        default: (scope: { state: ColorPickerSliderState }) =>
          h(
            Values,
            { state: scope.state },
            {
              default: () => slots["default"]?.(scope),
            },
          ),
      });
  },
}) as unknown as typeof Slider;

const Output = htmlPart("output", "color-slider-output", () => colorSliderStyles.output);
export const ColorSliderOutput: typeof Output = defineComponent({
  name: "LensoColorSliderOutput",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const channel = inject(Channel, undefined);
    return () => h(Output, attrs, { default: slots["default"] ?? (() => channel?.()) });
  },
}) as unknown as typeof Output;
export const ColorSlider: typeof ColorSliderRoot & {
  Root: typeof ColorSliderRoot;
  Thumb: typeof ColorSliderThumb;
  Label: typeof ColorSliderLabel;
  Track: typeof ColorSliderTrack;
  Output: typeof ColorSliderOutput;
} = Object.assign(ColorSliderRoot, {
  Root: ColorSliderRoot,
  Thumb: ColorSliderThumb,
  Label: ColorSliderLabel,
  Track: ColorSliderTrack,
  Output: ColorSliderOutput,
});
