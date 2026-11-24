import {
  progressCircleColors,
  progressCircleSizes,
  progressCircleStyles,
} from "@lenso/tokens/progress-circle";
import { Progress, ProgressLabel } from "@ui-sdk/solid/progress";
import { createContext, type ComponentProps, omit, useContext } from "solid-js";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

const Root: StyledPart<typeof Progress, { color?: keyof typeof progressCircleColors }> = sdkPart<
  ComponentProps<typeof Progress>,
  { color?: keyof typeof progressCircleColors }
>(
  Progress,
  "progress-circle",
  (props) => [progressCircleStyles.root, progressCircleColors[props.color ?? "accent"]],
  "color",
);
const Context = createContext<Pick<ProgressCircleProps, "size" | "value" | "min" | "max">>({});
export type ProgressCircleProps = ComponentProps<typeof Root> & {
  size?: keyof typeof progressCircleSizes;
};

export function ProgressCircleRoot(props: ProgressCircleProps) {
  return (
    <Context value={props}>
      <Root {...omit(props, "size")} />
    </Context>
  );
}

const Track = htmlPart("svg", "progress-circle-track", () => progressCircleStyles.track);
const TrackCircle = htmlPart(
  "circle",
  "progress-circle-track-circle",
  () => progressCircleStyles.trackCircle,
);
const FillCircle = htmlPart(
  "circle",
  "progress-circle-fill-circle",
  () => progressCircleStyles.fillCircle,
);

export function ProgressCircleTrack(props: ComponentProps<typeof Track>) {
  const progress = useContext(Context);
  return (
    <Track
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      {...omit(props, "xstyle")}
      xstyle={[
        progressCircleSizes[progress.size ?? "md"],
        progress.value == null && progressCircleStyles.indeterminate,
        props.xstyle,
      ]}
    />
  );
}

export function ProgressCircleTrackCircle(props: ComponentProps<typeof TrackCircle>) {
  return <TrackCircle cx={18} cy={18} r={16} stroke-width={4} {...props} />;
}

export function ProgressCircleFillCircle(props: ComponentProps<typeof FillCircle>) {
  const progress = useContext(Context);
  const radius = () => Number(props.r ?? 16);
  const circumference = () => 2 * Math.PI * radius();
  const percent = () => {
    const min = progress.min ?? 0;
    const max = progress.max ?? 100;
    return progress.value == null
      ? 0.25
      : max > min
        ? Math.max(0, Math.min(1, (progress.value - min) / (max - min)))
        : 0;
  };
  return (
    <FillCircle
      cx={18}
      cy={18}
      r={16}
      stroke-width={4}
      stroke-linecap="round"
      stroke-dasharray={String(circumference())}
      stroke-dashoffset={String(circumference() * (1 - percent()))}
      transform={`rotate(-90 ${props.cx ?? 18} ${props.cy ?? 18})`}
      {...props}
    />
  );
}

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
