import type * as React from "react";
import type * as stylex from "@stylexjs/stylex";

export type XStyle = stylex.StyleXStyles<Record<string, NonNullable<unknown> | null | undefined>>;

export type StyleXProps<Props> = Omit<Props, "className"> & {
  xstyle?: XStyle;
  "data-slot"?: unknown;
};

export function mergeStyle(
  compiled: React.CSSProperties | undefined,
  style: React.CSSProperties | undefined,
): React.CSSProperties;
export function mergeStyle<State>(
  compiled: React.CSSProperties | undefined,
  style: (state: State) => React.CSSProperties | undefined,
): (state: State) => React.CSSProperties;
export function mergeStyle<State>(
  compiled: React.CSSProperties | undefined,
  style: React.CSSProperties | ((state: State) => React.CSSProperties | undefined) | undefined,
): React.CSSProperties | ((state: State) => React.CSSProperties);
export function mergeStyle<State>(
  compiled: React.CSSProperties | undefined,
  style: React.CSSProperties | ((state: State) => React.CSSProperties | undefined) | undefined,
): React.CSSProperties | ((state: State) => React.CSSProperties) {
  return typeof style === "function"
    ? (state) => ({ ...compiled, ...style(state) })
    : { ...compiled, ...style };
}
