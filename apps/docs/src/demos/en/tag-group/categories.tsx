"use client";
// Shared pinned HeroUI v3.2.6 tag content (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { createElement } from "react";
import { PlanetEarth, Rocket, ShoppingBag, SquareArticle } from "@gravity-ui/icons";
import { Tag } from "@lenso/ui";
export const categories = ["News", "Travel", "Gaming", "Shopping"];
const icons = [SquareArticle, PlanetEarth, Rocket, ShoppingBag];
export const styles = stylex.create({
  stack: { display: "flex", flexDirection: "column", gap: 32 },
  sizes: { display: "flex", flexDirection: "column", gap: 24 },
  disabled: { display: "flex", flexDirection: "column", gap: 16 },
  custom: {
    gap: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklch, oklch(.87 0 0) 80%, transparent)",
      ":is([data-selected])": "oklch(.556 0 0)",
      ":is(.dark *,[data-theme='dark'] *)": "color-mix(in oklch, oklch(.439 0 0) 80%, transparent)",
      ":is(.dark *,[data-theme='dark'] *):is([data-selected])": "oklch(.708 0 0)",
    },
    backgroundColor: {
      default: "color-mix(in oklch, white 80%, transparent)",
      ":is([data-selected])": "oklch(.205 0 0)",
      ":is(.dark *,[data-theme='dark'] *)": "color-mix(in oklch, oklch(.205 0 0) 60%, transparent)",
      ":is(.dark *,[data-theme='dark'] *):is([data-selected])": "oklch(.97 0 0)",
    },
    paddingInline: 10,
    paddingBlock: 4,
    fontSize: 14,
    fontWeight: 500,
    color: {
      default: "oklch(.371 0 0)",
      ":is([data-selected])": "oklch(.985 0 0)",
      ":is(.dark *,[data-theme='dark'] *)": "oklch(.922 0 0)",
      ":is(.dark *,[data-theme='dark'] *):is([data-selected])": "oklch(.205 0 0)",
    },
    boxShadow: {
      default: "0 1px 2px #0000000d, 0 0 0 1px #0000000d",
      ":is(.dark *,[data-theme='dark'] *)": "0 1px 2px #0000000d, 0 0 0 1px #ffffff1a",
    },
    backdropFilter: "blur(4px)",
    transitionProperty: "color, background-color, border-color",
    transitionDuration: { default: "150ms", "@media (prefers-reduced-motion: reduce)": "0ms" },
  },
  list: { gap: 8 },
  width: { width: 384, maxWidth: "100%" },
  avatar: { width: 16, height: 16 },
  selected: { display: "flex", flexWrap: "wrap", gap: 8, marginBlockStart: 16 },
  selectedUser: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 8,
    backgroundColor: "var(--surface-tertiary)",
    paddingInline: 8,
    paddingBlock: 4,
    fontSize: 14,
  },
});
export function Categories({
  icons: withIcons = false,
  custom = false,
  disabled = false,
  prefix = "",
  count = 4,
}: {
  icons?: boolean;
  custom?: boolean;
  disabled?: boolean;
  prefix?: string;
  count?: number;
}) {
  return categories.slice(0, count).map((name, index) => (
    <Tag
      key={name}
      itemKey={`${prefix}${name.toLowerCase()}`}
      textValue={name}
      disabled={disabled && index !== 1}
      xstyle={custom && styles.custom}
    >
      {withIcons &&
        createElement(icons[index]!, {
          width: custom ? 16 : 12,
          height: custom ? 16 : 12,
          "aria-hidden": true,
        })}
      {name}
    </Tag>
  ));
}
