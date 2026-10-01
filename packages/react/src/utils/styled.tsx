"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

export type XStyle = stylex.StyleXStyles<Record<string, NonNullable<unknown> | null | undefined>>;
type BaseStyle = stylex.CompiledStyles | readonly BaseStyle[];

export type StyleXProps<Props> = Omit<Props, "className"> & { xstyle?: XStyle };

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

export function styledPart<Component extends React.ElementType>(
  Component: Component,
  slot: string,
  baseStyle?: BaseStyle,
) {
  return function Part({
    xstyle,
    style,
    ...props
  }: StyleXProps<React.ComponentPropsWithRef<Component>>) {
    const compiled = stylex.props(baseStyle, xstyle);
    return React.createElement(Component, {
      ...props,
      ...compiled,
      style: mergeStyle(compiled.style, style),
      "data-slot": (props as { "data-slot"?: string })["data-slot"] ?? slot,
    } as React.ComponentPropsWithRef<Component>);
  };
}
