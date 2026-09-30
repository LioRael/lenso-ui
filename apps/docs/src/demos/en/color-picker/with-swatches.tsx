"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. */
import { ColorArea, ColorPicker, ColorSlider, ColorSwatch, ColorSwatchPicker } from "@lenso/ui";
import { styles } from "./source.stylex";
const presets = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
];
export function WithSwatches() {
  return (
    <ColorPicker defaultValue="#F43F5E">
      <ColorPicker.Trigger>
        <ColorSwatch size="lg" />
        <span>Brand Color</span>
      </ColorPicker.Trigger>
      <ColorPicker.Popover>
        <ColorArea
          aria-label="Color area"
          xstyle={styles.area}
          colorSpace="hsb"
          xChannel="saturation"
          yChannel="brightness"
        >
          <ColorArea.Thumb />
        </ColorArea>
        <ColorSlider aria-label="Hue slider" channel="hue" xstyle={styles.slider} colorSpace="hsb">
          <ColorSlider.Label>Hue</ColorSlider.Label>
          <ColorSlider.Output xstyle={styles.output} />
          <ColorSlider.Track>
            <ColorSlider.Thumb />
          </ColorSlider.Track>
        </ColorSlider>
        <ColorSwatchPicker aria-label="Color presets" xstyle={styles.swatches} size="xs">
          {presets.map((preset) => (
            <ColorSwatchPicker.Item key={preset} color={preset}>
              <ColorSwatchPicker.Swatch />
            </ColorSwatchPicker.Item>
          ))}
        </ColorSwatchPicker>
      </ColorPicker.Popover>
    </ColorPicker>
  );
}
