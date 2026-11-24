// Copyright NextUI Inc. Apache-2.0. Modified for Solid and native CSS colors.
import { colorSwatchStyles as s } from "@lenso/tokens/color-swatch";
import { omit, type ComponentProps } from "solid-js";
import { htmlPart } from "./parts.js";

const Swatch = htmlPart<
  "div",
  {
    color?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    shape?: "circle" | "square";
  }
>(
  "div",
  "color-swatch",
  (props) => [s.root, s[props.size ?? "md"], props.shape === "square" && s.square],
  "color",
  "size",
  "shape",
);

export type ColorSwatchProps = ComponentProps<typeof Swatch> & { colorName?: string };

export function ColorSwatchRoot(props: ColorSwatchProps) {
  const color = () => props.color ?? "#ff0000";
  const background = () =>
    `linear-gradient(${color()},${color()}),var(--lenso-color-checkerboard) 50% / 16px 16px`;
  return (
    <Swatch
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- The image is a CSS swatch with no source URL.
      role="img"
      aria-label={props.colorName ?? color()}
      {...omit(props, "colorName", "style")}
      style={
        typeof props.style === "string"
          ? `background:${background()};${props.style}`
          : { background: background(), ...props.style }
      }
    />
  );
}

export const ColorSwatch = Object.assign(ColorSwatchRoot, { Root: ColorSwatchRoot });
