"use client";

import * as React from "react";
import * as stylex from "@stylexjs/stylex";

import { mergeClassName } from "./merge-class-name.js";

type ComponentClassName<Component extends React.ElementType> =
  React.ComponentPropsWithRef<Component> extends { className?: infer ClassName }
    ? ClassName
    : never;

type StyledPartProps<Component extends React.ElementType> = React.ComponentPropsWithRef<Component> &
  React.RefAttributes<React.ComponentRef<Component>> & {
    className?: ComponentClassName<Component>;
  };

export function createStyledPart<Component extends React.ElementType>(
  Component: Component,
  slot: string,
  style: stylex.CompiledStyles,
) {
  return function StyledPart({ className, ref, ...props }: StyledPartProps<Component>) {
    return React.createElement(Component, {
      ...props,
      className: mergeClassName(
        stylex.props(style).className,
        className,
      ) as ComponentClassName<Component>,
      "data-slot": slot,
      ref,
    } as React.ComponentPropsWithRef<Component>);
  };
}
