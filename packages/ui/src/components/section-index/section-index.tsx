"use client";
import { SectionIndex as Primitive, type SectionIndexItem } from "@lenso/primitives/section-index";
import type { ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { sectionIndexStyles as s } from "@lenso/tokens/section-index";
import { mergeStyle, type StyleXProps } from "../../utils/styled.js";
export type { SectionIndexItem };
export type {
  SectionIndexController,
  SectionIndexReason as SectionIndexChangeReason,
} from "@lenso/primitives/section-index";
export { createSectionIndexController } from "@lenso/primitives/section-index";
export type SectionIndexProps = StyleXProps<ComponentProps<typeof Primitive.Root>>;
export function SectionIndex({ items, xstyle, style, ...props }: SectionIndexProps) {
  const compiled = stylex.props(s.root, props.disabled && s.disabled, xstyle);
  return (
    <Primitive.Root
      aria-label="Section index"
      {...props}
      data-lenso-slot={props["data-lenso-slot"] ?? "section-index"}
      items={items}
      {...compiled}
      style={mergeStyle(compiled.style, style)}
    >
      {items.map((item) => (
        <Primitive.Item
          key={item.value}
          data-lenso-slot="section-index-item"
          value={item.value}
          href={item.href}
          disabled={item.disabled}
          {...stylex.props(s.item)}
        >
          {item.label}
        </Primitive.Item>
      ))}
    </Primitive.Root>
  );
}
