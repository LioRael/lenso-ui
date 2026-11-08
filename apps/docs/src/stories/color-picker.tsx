"use client";
import { useState } from "react";
import { Plus } from "@gravity-ui/icons";
import {
  Button,
  ColorArea,
  ColorField,
  ColorPicker,
  ColorSlider,
  ColorSwatch,
  ColorSwatchPicker,
  CloseButton,
  Popover,
  Tabs,
} from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { appleColorPalette } from "./apple-color-palette";
export interface ColorPickerStoryProps {
  initialColor: string;
  defaultOpen: boolean;
}
const s = stylex.create({
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 49 },
  heading: { margin: 0, fontSize: 17, lineHeight: "22px", fontWeight: 600 },
  tabs: { width: "100%" },
  panel: { padding: 0, margin: 0, minHeight: 296 },
  area: { height: 296, aspectRatio: "auto", maxWidth: "100%", borderRadius: 10 },
  sliders: { display: "flex", flexDirection: "column", gap: 24, paddingBlock: 16 },
  label: { fontSize: 13, lineHeight: "20px", fontWeight: 600 },
  channel: { display: "flex", alignItems: "end", gap: 11 },
  channelSlider: { flex: 1, minWidth: 0, gap: 8 },
  channelField: { width: 75, flexShrink: 0 },
  channelInput: { textAlign: "center", fontWeight: 600 },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 30,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "var(--lenso-separator)",
    paddingTop: 12,
  },
  current: { width: 75, height: 75, borderRadius: 10, flexShrink: 0 },
  saved: {
    flex: 1,
    minWidth: 0,
    display: "grid",
    gridTemplateColumns: "repeat(5, 30px)",
    gridTemplateRows: "repeat(2, 30px)",
    justifyContent: "space-between",
    gap: "15px 4px",
  },
  dot: { width: 30, height: 30, borderRadius: 100 },
  save: { width: 30, height: 30, minWidth: 0, padding: 0, borderRadius: 100 },
});
function SavedColors({ colors, onSave }: { colors: string[]; onSave: () => void }) {
  return (
    <div {...stylex.props(s.divider)}>
      <ColorSwatch aria-label="Current color" xstyle={s.current} />
      <ColorSwatchPicker aria-label="Saved colors" xstyle={s.saved}>
        {colors.map((color) => (
          <ColorSwatchPicker.Item key={color} color={color} xstyle={s.dot}>
            <ColorSwatchPicker.Swatch />
          </ColorSwatchPicker.Item>
        ))}
        <Button aria-label="Save current color" xstyle={s.save} onClick={onSave}>
          <Plus width={18} height={18} />
        </Button>
      </ColorSwatchPicker>
    </div>
  );
}
function Channel({ channel }: { channel: "red" | "green" | "blue" | "alpha" }) {
  const label = channel === "alpha" ? "Opacity" : channel[0]!.toUpperCase() + channel.slice(1);
  return (
    <div {...stylex.props(s.channel)}>
      <ColorSlider channel={channel} colorSpace="rgb" aria-label={label} xstyle={s.channelSlider}>
        <ColorSlider.Label xstyle={s.label}>{label}</ColorSlider.Label>
        <ColorSlider.Track>
          <ColorSlider.Thumb />
        </ColorSlider.Track>
      </ColorSlider>
      <ColorField
        channel={channel}
        colorSpace="rgb"
        aria-label={`${label} value`}
        xstyle={s.channelField}
      >
        <ColorField.Group fullWidth>
          <ColorField.Input xstyle={s.channelInput} />
        </ColorField.Group>
      </ColorField>
    </div>
  );
}
export function ColorPickerStory({ initialColor, defaultOpen }: ColorPickerStoryProps) {
  const [colors, setColors] = useState([
    "#FF3B30FF",
    "#FF9500FF",
    "#FFCC00FF",
    "#34C759FF",
    "#00C7BEFF",
    "#007AFFFF",
    "#5856D6FF",
    "#AF52DEFF",
    "#FF2D55FF",
  ]);
  return (
    <ColorPicker defaultValue={initialColor} defaultOpen={defaultOpen}>
      {(state) => (
        <>
          <ColorPicker.Trigger>
            <ColorSwatch size="lg" />
            <span>Pick a color</span>
          </ColorPicker.Trigger>
          <ColorPicker.Popover aria-label="Colors">
            <div {...stylex.props(s.header)}>
              <h2 {...stylex.props(s.heading)}>Colors</h2>
              <Popover.Close render={<CloseButton aria-label="Close colors" />} />
            </div>
            <Tabs defaultValue="grid" glass={false} xstyle={s.tabs}>
              <Tabs.ListContainer>
                <Tabs.List aria-label="Color selection method">
                  <Tabs.Tab value="grid">Grid</Tabs.Tab>
                  <Tabs.Tab value="spectrum">Spectrum</Tabs.Tab>
                  <Tabs.Tab value="sliders">Sliders</Tabs.Tab>
                  <Tabs.Indicator />
                </Tabs.List>
              </Tabs.ListContainer>
              <Tabs.Panel value="grid" xstyle={s.panel}>
                <ColorSwatchPicker layout="palette" aria-label="Color palette">
                  {appleColorPalette.map((color, index) => (
                    <ColorSwatchPicker.Item key={index} color={color}>
                      <ColorSwatchPicker.Swatch />
                    </ColorSwatchPicker.Item>
                  ))}
                </ColorSwatchPicker>
              </Tabs.Panel>
              <Tabs.Panel value="spectrum" xstyle={s.panel}>
                <ColorArea
                  aria-label="Color spectrum"
                  xstyle={s.area}
                  colorSpace="hsb"
                  xChannel="saturation"
                  yChannel="brightness"
                >
                  <ColorArea.Thumb />
                </ColorArea>
              </Tabs.Panel>
              <Tabs.Panel value="sliders" xstyle={[s.panel, s.sliders]}>
                <Channel channel="red" />
                <Channel channel="green" />
                <Channel channel="blue" />
                <ColorField>
                  <ColorField.Label>Hex color</ColorField.Label>
                  <ColorField.Group>
                    <ColorField.Input />
                  </ColorField.Group>
                </ColorField>
              </Tabs.Panel>
            </Tabs>
            <Channel channel="alpha" />
            <SavedColors
              colors={colors}
              onSave={() => {
                const current = state.color.toString("hexa").toUpperCase();
                setColors((previous) =>
                  previous.includes(current) ? previous : [...previous.slice(-8), current],
                );
              }}
            />
          </ColorPicker.Popover>
        </>
      )}
    </ColorPicker>
  );
}
