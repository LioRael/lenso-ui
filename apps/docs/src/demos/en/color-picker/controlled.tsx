"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. Gravity Shuffle replaces the source Iconify reference to the same icon. */
import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  parseColor,
} from "@lenso/ui";
import { Shuffle } from "@gravity-ui/icons";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
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
export function Controlled() {
  const [color, setColor] = useState(parseColor("#325578"));
  function shuffleColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 50 + Math.floor(Math.random() * 50);
    const lightness = 40 + Math.floor(Math.random() * 30);
    setColor(parseColor(`hsl(${hue}, ${saturation}%, ${lightness}%)`));
  }
  return (
    <div {...stylex.props(styles.column)}>
      <ColorPicker value={color} onChange={setColor}>
        <ColorPicker.Trigger>
          <ColorSwatch size="lg" />
          <span>Pick a color</span>
        </ColorPicker.Trigger>
        <ColorPicker.Popover xstyle={styles.popover}>
          <ColorSwatchPicker aria-label="Color presets" xstyle={styles.presets} size="xs">
            {presets.map((preset) => (
              <ColorSwatchPicker.Item key={preset} color={preset}>
                <ColorSwatchPicker.Swatch />
              </ColorSwatchPicker.Item>
            ))}
          </ColorSwatchPicker>
          <ColorArea
            aria-label="Color area"
            xstyle={styles.area}
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
          >
            <ColorArea.Thumb />
          </ColorArea>
          <div {...stylex.props(styles.hueRow)}>
            <ColorSlider
              aria-label="Hue slider"
              channel="hue"
              xstyle={styles.flex1}
              colorSpace="hsb"
            >
              <ColorSlider.Track>
                <ColorSlider.Thumb />
              </ColorSlider.Track>
            </ColorSlider>
            <Button
              isIconOnly
              aria-label="Shuffle color"
              size="sm"
              variant="tertiary"
              onClick={shuffleColor}
            >
              <Shuffle {...stylex.props(styles.icon)} />
            </Button>
          </div>
          <ColorField aria-label="Color field">
            <ColorField.Group variant="secondary">
              <ColorField.Prefix>
                <ColorSwatch size="xs" />
              </ColorField.Prefix>
              <ColorField.Input />
            </ColorField.Group>
          </ColorField>
        </ColorPicker.Popover>
      </ColorPicker>
      <p {...stylex.props(styles.selected)}>
        Selected: <span {...stylex.props(styles.medium)}>{color.toString("hex")}</span>
      </p>
    </div>
  );
}
