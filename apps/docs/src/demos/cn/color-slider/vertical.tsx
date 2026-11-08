"use client";

const CN_CHANNEL_LABELS: Record<string, string> = {
  hue: "色相",
  saturation: "饱和度",
  lightness: "明度",
};
import { ColorSlider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/color-picker/source.stylex";
export function Vertical() {
  return (
    <div {...stylex.props(styles.vertical)}>
      {(["hue", "saturation", "lightness"] as const).map((channel) => (
        <ColorSlider
          key={channel}
          aria-label={CN_CHANNEL_LABELS[channel]}
          channel={channel}
          defaultValue="hsl(0, 100%, 50%)"
          orientation="vertical"
        >
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
      ))}
    </div>
  );
}
