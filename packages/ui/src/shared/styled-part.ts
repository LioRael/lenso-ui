"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import type { StyleXComponentProps } from "./stylex-props.js";

export function createStyledPart<Component extends React.ElementType>(
  Component: Component,
  slot: string,
  baseStyle: stylex.CompiledStyles,
) {
  return function StyledPart({ ref, xstyle, ...props }: StyleXComponentProps<Component>) {
    return React.createElement(Component, {
      ...props,
      className: stylex.props(baseStyle, xstyle).className,
      "data-slot": slot,
      ref,
    } as React.ComponentPropsWithRef<Component>);
  };
}
