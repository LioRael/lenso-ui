"use client";
/** Adapted from HeroUI v3.2.6. Apache-2.0. Base UI owns the ordinary selects. */
import { ColorArea, parseColor } from "@lenso/ui";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../color-picker/source.stylex";
import { ColorDemoSelect } from "../color-picker/source";
type Space = "rgb" | "hsl" | "hsb";
type Channel = "hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue";
const channelsBySpace: Record<Space, Channel[]> = {
  rgb: ["red", "green", "blue"],
  hsl: ["hue", "saturation", "lightness"],
  hsb: ["hue", "saturation", "brightness"],
};
export function ColorAreaSpaceAndChannels() {
  const [colorSpace, setColorSpace] = useState<Space>("hsb");
  const [color, setColor] = useState(() => parseColor("hsb(219, 58%, 93%)"));
  const [xChannel, setXChannel] = useState<Channel>("saturation");
  const [yChannel, setYChannel] = useState<Channel>("brightness");
  function changeSpace(space: Space) {
    setColorSpace(space);
    setXChannel(space === "rgb" ? "blue" : "saturation");
    setYChannel(space === "rgb" ? "green" : space === "hsl" ? "lightness" : "brightness");
  }
  const channels = channelsBySpace[colorSpace];
  return (
    <div {...stylex.props(styles.centeredColumn)}>
      <div {...stylex.props(styles.controls)}>
        <ColorDemoSelect
          label="Color Space"
          value={colorSpace}
          options={["rgb", "hsl", "hsb"]}
          onChange={changeSpace}
          width={128}
          uppercase
        />
        <ColorDemoSelect
          label="X Axis"
          value={xChannel}
          options={channels.filter((c) => c !== yChannel)}
          onChange={setXChannel}
          width={144}
        />
        <ColorDemoSelect
          label="Y Axis"
          value={yChannel}
          options={channels.filter((c) => c !== xChannel)}
          onChange={setYChannel}
          width={144}
        />
      </div>
      <ColorArea
        aria-label="Color area"
        colorSpace={colorSpace}
        value={color}
        xChannel={xChannel}
        yChannel={yChannel}
        onChange={setColor}
      >
        <ColorArea.Thumb />
      </ColorArea>
      <div {...stylex.props(styles.row)}>
        <div {...stylex.props(styles.preview)} style={{ backgroundColor: color.toString("css") }} />
        <code {...stylex.props(styles.code)}>{color.toString(colorSpace)}</code>
      </div>
    </div>
  );
}
