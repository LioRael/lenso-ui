import {
  progressCircleColors,
  progressCircleSizes,
  progressCircleStyles,
} from "@lenso/tokens/progress-circle";
import { Progress, ProgressLabel } from "@ui-sdk/vue/progress";
import { defineComponent, h, inject, provide, type InjectionKey, type PropType } from "vue";
import {
  partAttributes,
  sdkPart,
  type ComponentProps,
  type HtmlPart,
  type StyledPart,
} from "./parts.js";

type Appearance = {
  color?: keyof typeof progressCircleColors;
  size?: keyof typeof progressCircleSizes;
};
type State = { size?: Appearance["size"]; value?: number | null; min?: number; max?: number };
const Context: InjectionKey<State> = Symbol("ProgressCircle");
const Root: StyledPart<typeof Progress, Pick<Appearance, "color">> = sdkPart<
  typeof Progress,
  Pick<Appearance, "color">
>(
  Progress,
  "progress-circle",
  (props) => [progressCircleStyles.root, progressCircleColors[props.color ?? "accent"]],
  "color",
);

export const ProgressCircleRoot: StyledPart<typeof Progress, Appearance> = defineComponent({
  name: "LensoProgressCircle",
  inheritAttrs: false,
  props: {
    size: String as PropType<Appearance["size"]>,
    value: Number,
    min: Number,
    max: Number,
  },
  setup(props, { attrs, slots }) {
    provide(Context, props);
    return () => h(Root, { ...attrs, value: props.value, min: props.min, max: props.max }, slots);
  },
}) as unknown as StyledPart<typeof Progress, Appearance>;
export type ProgressCircleProps = ComponentProps<typeof ProgressCircleRoot>;

export const ProgressCircleTrack: HtmlPart<"svg"> = defineComponent({
  name: "LensoProgressCircleTrack",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const progress = inject(Context, {});
    return () =>
      h(
        "svg",
        partAttributes(
          "progress-circle-track",
          [
            progressCircleStyles.track,
            progressCircleSizes[progress.size ?? "md"],
            progress.value == null && progressCircleStyles.indeterminate,
          ],
          { viewBox: "0 0 36 36", fill: "none", "aria-hidden": "true", ...attrs },
        ),
        slots["default"]?.(),
      );
  },
}) as unknown as HtmlPart<"svg">;
export const ProgressCircleTrackCircle: HtmlPart<"circle"> = defineComponent({
  name: "LensoProgressCircleTrackCircle",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return () =>
      h(
        "circle",
        partAttributes("progress-circle-track-circle", progressCircleStyles.trackCircle, {
          cx: 18,
          cy: 18,
          r: 16,
          "stroke-width": 4,
          ...attrs,
        }),
      );
  },
}) as unknown as HtmlPart<"circle">;
export const ProgressCircleFillCircle: HtmlPart<"circle"> = defineComponent({
  name: "LensoProgressCircleFillCircle",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const progress = inject(Context, {});
    return () => {
      const circumference = 2 * Math.PI * Number(attrs["r"] ?? 16);
      const min = progress.min ?? 0;
      const max = progress.max ?? 100;
      const percent =
        progress.value == null
          ? 0.25
          : max > min
            ? Math.max(0, Math.min(1, (progress.value - min) / (max - min)))
            : 0;
      return h(
        "circle",
        partAttributes("progress-circle-fill-circle", progressCircleStyles.fillCircle, {
          cx: 18,
          cy: 18,
          r: 16,
          "stroke-width": 4,
          "stroke-linecap": "round",
          "stroke-dasharray": String(circumference),
          "stroke-dashoffset": String(circumference * (1 - percent)),
          transform: `rotate(-90 ${attrs["cx"] ?? 18} ${attrs["cy"] ?? 18})`,
          ...attrs,
        }),
      );
    };
  },
}) as unknown as HtmlPart<"circle">;

export const ProgressCircleLabel: StyledPart<typeof ProgressLabel> = sdkPart(
  ProgressLabel,
  "label",
  () => undefined,
);
export const ProgressCircle: typeof ProgressCircleRoot & {
  Root: typeof ProgressCircleRoot;
  Label: typeof ProgressCircleLabel;
  Track: typeof ProgressCircleTrack;
  TrackCircle: typeof ProgressCircleTrackCircle;
  FillCircle: typeof ProgressCircleFillCircle;
} = Object.assign(ProgressCircleRoot, {
  Root: ProgressCircleRoot,
  Label: ProgressCircleLabel,
  Track: ProgressCircleTrack,
  TrackCircle: ProgressCircleTrackCircle,
  FillCircle: ProgressCircleFillCircle,
});
