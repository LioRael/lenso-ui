import { createContext, useContext, omit, type ComponentProps } from "solid-js";
import { htmlPart } from "./parts.js";
import { colorSliderStyles } from "@lenso/tokens/color-slider";
import {
  ColorPickerSlider as SdkRoot,
  ColorPickerSliderThumb as SdkThumb,
} from "@ui-sdk/solid/color-picker";
import { sdkPart, type StyledPart } from "./parts.js";

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
const Channel = createContext<() => number>();
export function ColorSliderRoot(props: ComponentProps<typeof Slider>) {
  return (
    <Slider {...omit(props, "children")}>
      {!("children" in props)
        ? undefined
        : (state) => (
            <Channel value={() => state.channelValue}>
              {(() => {
                const child = props.children;
                return typeof child === "function" ? child(state) : child;
              })()}
            </Channel>
          )}
    </Slider>
  );
}
const Output = htmlPart("output", "color-slider-output", () => colorSliderStyles.output);
export function ColorSliderOutput(props: ComponentProps<typeof Output>) {
  const value = useContext(Channel);
  return <Output {...props}>{props.children ?? value()}</Output>;
}
export const ColorSlider: typeof ColorSliderRoot & {
  Label: typeof ColorSliderLabel;
  Track: typeof ColorSliderTrack;
  Output: typeof ColorSliderOutput;
  Root: typeof ColorSliderRoot;
  Thumb: typeof ColorSliderThumb;
} = Object.assign(ColorSliderRoot, {
  Label: ColorSliderLabel,
  Track: ColorSliderTrack,
  Output: ColorSliderOutput,
  Root: ColorSliderRoot,
  Thumb: ColorSliderThumb,
});
