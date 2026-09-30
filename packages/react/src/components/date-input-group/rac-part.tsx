"use client";
/**
 * Lenso's isolated date/time/color RAC boundary.
 * RAC className receives state, unlike a static DOM or Base UI part.
 */
import {
  createElement,
  type ComponentPropsWithRef,
  type ElementType,
  type CSSProperties,
} from "react";
import * as stylex from "@stylexjs/stylex";
import type { StyleXProps } from "../../utils/styled.js";

export function racPart<C extends ElementType, State>(
  Component: C,
  slot: string,
  resolve: (state: State) => stylex.StyleXStyles<Record<string, unknown>>,
) {
  return function Part({ xstyle, style, ...props }: StyleXProps<ComponentPropsWithRef<C>>) {
    const compiled = (state: State) => stylex.props(resolve(state), xstyle);
    return createElement(Component, {
      ...props,
      "data-slot": (props as { "data-slot"?: string })["data-slot"] ?? slot,
      className: (state: State) => compiled(state).className,
      style: (state: State & { defaultStyle?: CSSProperties }) => ({
        ...state.defaultStyle,
        ...compiled(state).style,
        ...(typeof style === "function" ? style(state) : style),
      }),
    });
  };
}
