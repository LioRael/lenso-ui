"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import { kbdStyles } from "@lenso/tokens/kbd";
import * as stylex from "@stylexjs/stylex";
import { type StyleXProps } from "../../utils/styled.js";
const keys = {
  command: ["⌘", "Command"],
  shift: ["⇧", "Shift"],
  ctrl: ["⌃", "Control"],
  option: ["⌥", "Option"],
  enter: ["↵", "Enter"],
  delete: ["⌫", "Delete"],
  escape: ["⎋", "Escape"],
  tab: ["⇥", "Tab"],
  capslock: ["⇪", "Caps Lock"],
  up: ["↑", "Up"],
  right: ["→", "Right"],
  down: ["↓", "Down"],
  left: ["←", "Left"],
  pageup: ["⇞", "Page Up"],
  pagedown: ["⇟", "Page Down"],
  home: ["↖", "Home"],
  end: ["↘", "End"],
  help: ["?", "Help"],
  space: ["␣", "Space"],
  fn: ["Fn", "Fn"],
  win: ["⌘", "Win"],
  alt: ["⌥", "Alt"],
} as const;
export type KbdKey = keyof typeof keys;
export type KbdRootProps = StyleXProps<ComponentProps<"kbd">> & { variant?: "default" | "light" };
export type KbdAbbrProps = StyleXProps<ComponentProps<"abbr">> & { keyValue: KbdKey };
export function KbdRoot({ variant = "default", xstyle, style, ...props }: KbdRootProps) {
  const compiled = stylex.props(kbdStyles.root, variant === "light" && kbdStyles.light, xstyle);
  return (
    <kbd
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "kbd"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export function KbdAbbr({ keyValue, xstyle, style, ...props }: KbdAbbrProps) {
  const compiled = stylex.props(kbdStyles.abbr, xstyle);
  return (
    <abbr
      title={keys[keyValue][1]}
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "kbd-abbr"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    >
      {keys[keyValue][0]}
    </abbr>
  );
}
export function KbdContent({ xstyle, style, ...props }: StyleXProps<ComponentProps<"span">>) {
  const compiled = stylex.props(kbdStyles.content, xstyle);
  return (
    <span
      {...props}
      data-slot={(props as { "data-slot"?: string })["data-slot"] ?? "kbd-content"}
      {...compiled}
      style={{ ...compiled.style, ...style }}
    />
  );
}
export const Kbd = Object.assign(KbdRoot, { Root: KbdRoot, Abbr: KbdAbbr, Content: KbdContent });
export type KbdProps = KbdRootProps;
export type KbdContentProps = ComponentProps<typeof KbdContent>;
export type Kbd = {
  Props: KbdProps;
  RootProps: KbdRootProps;
  AbbrProps: KbdAbbrProps;
  ContentProps: KbdContentProps;
};
