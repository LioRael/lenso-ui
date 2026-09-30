"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native HTML and StyleX.
import type { ComponentProps } from "react";
import { kbdStyles } from "@lenso/tokens/kbd";
import { styledPart, type StyleXProps } from "../../utils/styled.js";
const Root = styledPart("kbd", "kbd", kbdStyles.root);
const Abbr = styledPart("abbr", "kbd-abbr", kbdStyles.abbr);
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
export function KbdRoot({ variant = "default", xstyle, ...props }: KbdRootProps) {
  return <Root {...props} xstyle={[variant === "light" && kbdStyles.light, xstyle]} />;
}
export function KbdAbbr({ keyValue, ...props }: KbdAbbrProps) {
  return (
    <Abbr title={keys[keyValue][1]} {...props}>
      {keys[keyValue][0]}
    </Abbr>
  );
}
export const KbdContent = styledPart("span", "kbd-content", kbdStyles.content);
export const Kbd = Object.assign(KbdRoot, { Root: KbdRoot, Abbr: KbdAbbr, Content: KbdContent });
export type KbdProps = KbdRootProps;
export type KbdContentProps = ComponentProps<typeof KbdContent>;
export type Kbd = {
  Props: KbdProps;
  RootProps: KbdRootProps;
  AbbrProps: KbdAbbrProps;
  ContentProps: KbdContentProps;
};
