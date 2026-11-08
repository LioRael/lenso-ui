// Adapted from React Aria 3.52.1 useColorAreaGradient, Copyright 2022 Adobe.
// SPDX-License-Identifier: Apache-2.0. Pure gradient calculation; no interaction hooks.
import { parseColor, type Color, type ColorAxes, type ColorChannel } from "react-stately/Color";
import type { CSSProperties } from "react";
export function colorAreaGradient(
  color: Color,
  { xChannel, yChannel, zChannel }: ColorAxes,
  direction: "ltr" | "rtl",
): CSSProperties {
  const end = direction === "rtl" ? "left" : "right";
  const z = color.getChannelValue(zChannel);
  const space = color.getColorSpace();
  if (space === "rgb") {
    const black = parseColor("rgb(0, 0, 0)");
    return {
      background: [
        `linear-gradient(to ${end}, ${black.withChannelValue(xChannel, 0)}, ${black.withChannelValue(xChannel, 255)})`,
        `linear-gradient(to top, ${black.withChannelValue(yChannel, 0)}, ${black.withChannelValue(yChannel, 255)})`,
        black.withChannelValue(zChannel, z).toString("css"),
      ].join(","),
      backgroundBlendMode: "screen",
    };
  }
  const value = parseColor(
    space === "hsl" ? "hsl(0, 100%, 50%)" : "hsb(0, 100%, 100%)",
  ).withChannelValue(zChannel, z);
  const stops = (channel: ColorChannel) => {
    if (channel === "hue")
      return [0, 60, 120, 180, 240, 300, 360]
        .map((hue) => value.withChannelValue("hue", hue).toString("css"))
        .join(", ");
    if (channel === "saturation") return `${value.withChannelValue("saturation", 0)}, transparent`;
    return channel === "lightness" ? "black, transparent, white" : "black, transparent";
  };
  const layers = value
    .getColorChannels()
    .filter((channel) => channel !== zChannel)
    .map(
      (channel) => `linear-gradient(to ${channel === xChannel ? end : "top"}, ${stops(channel)})`,
    )
    .reverse();
  if (zChannel === "hue") layers.push(value.toString("css"));
  return { background: layers.join(", "), backgroundBlendMode: "normal" };
}
