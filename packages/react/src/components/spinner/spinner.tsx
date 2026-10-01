"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML, SVG and StyleX.
import { useId, type ComponentProps } from "react";
import { spinnerStyles, spinnerSizes, spinnerColors } from "@lenso/tokens/spinner";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
export type SpinnerRootProps = StyleXProps<ComponentProps<"span">> & {
  size?: keyof typeof spinnerSizes;
  color?: keyof typeof spinnerColors;
};
export function SpinnerRoot({
  size = "md",
  color = "current",
  xstyle,
  style,
  children: _children,
  ...props
}: SpinnerRootProps) {
  const id = useId();
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
        viewBox="0 0 24 24"
      >
        <defs>
          <linearGradient id={`${id}-start`} x1="50%" x2="50%" y1="5.271%" y2="91.793%">
            <stop offset="0%" stopColor="currentColor" />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0.55} />
          </linearGradient>
          <linearGradient id={`${id}-end`} x1="50%" x2="50%" y1="15.24%" y2="87.15%">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <g fill="none">
          <path
            d="M8.749.021a1.5 1.5 0 0 1 .497 2.958A7.5 7.5 0 0 0 3 10.375a7.5 7.5 0 0 0 7.5 7.5v3c-5.799 0-10.5-4.7-10.5-10.5C0 5.23 3.726.865 8.749.021"
            fill={`url(#${id}-start)`}
            transform="translate(1.5 1.625)"
          />
          <path
            d="M15.392 2.673a1.5 1.5 0 0 1 2.119-.115A10.48 10.48 0 0 1 21 10.375c0 5.8-4.701 10.5-10.5 10.5v-3a7.5 7.5 0 0 0 5.007-13.084a1.5 1.5 0 0 1-.115-2.118"
            fill={`url(#${id}-end)`}
            transform="translate(1.5 1.625)"
          />
        </g>
      </svg>
    </span>
  );
}
export const Spinner = Object.assign(SpinnerRoot, { Root: SpinnerRoot });
export type SpinnerProps = SpinnerRootProps;
export type Spinner = { Props: SpinnerProps; RootProps: SpinnerRootProps };
