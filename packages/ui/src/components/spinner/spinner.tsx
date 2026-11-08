"use client";
// modified for native HTML, SVG and StyleX.
import { type ComponentProps } from "react";
import { spinnerStyles, spinnerSizes, spinnerColors } from "@lenso/tokens/spinner";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type SpinnerRootProps = StyleXProps<ComponentProps<"span">> & {
  size?: keyof typeof spinnerSizes;
  color?: keyof typeof spinnerColors;
};
export function SpinnerRoot({
  size = "md",
  color = "secondary",
  xstyle,
  style,
  children: _children,
  ...props
}: SpinnerRootProps) {
  const small = size === "sm";
  const dimension = small ? 22 : 30;
  const thickness = small ? 3 : 4;
  const length = small ? 7 : 10;
  const compiled = stylex.props(
    spinnerStyles.root,
    spinnerSizes[size],
    spinnerColors[color],
    xstyle,
  );
  return (
    <span
      // Keep source span anatomy: loading status is not a form-associated output value.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="status"
      aria-label="Loading"
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "spinner"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    >
      <svg
        data-slot="spinner-icon"
        {...stylex.props(spinnerStyles.icon)}
        aria-hidden="true"
        viewBox={`0 0 ${dimension} ${dimension}`}
      >
        {/* Geometry follows Apple 40:58300 / 40:58436; timing is a Web adaptation. */}
        {Array.from({ length: 8 }, (_, index) => (
          <rect
            key={index}
            x={(dimension - thickness) / 2}
            y={0}
            width={thickness}
            height={length}
            rx={thickness / 2}
            fill="currentColor"
            opacity={1 - index * 0.12}
            transform={`rotate(${index * 45} ${dimension / 2} ${dimension / 2})`}
          />
        ))}
      </svg>
    </span>
  );
}
export const Spinner = Object.assign(SpinnerRoot, { Root: SpinnerRoot });
export type SpinnerProps = SpinnerRootProps;
export type Spinner = { Props: SpinnerProps; RootProps: SpinnerRootProps };
