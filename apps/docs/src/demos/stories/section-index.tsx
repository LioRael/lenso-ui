"use client";
import { useId, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Avatar, NavigationBar, SectionIndex, List } from "@lenso/ui";
import { ScrollEdge } from "@/stories/scroll-edge";
const produce = [
  ["Apricot", "Artichoke", "Avocado"],
  ["Banana", "Beetroot", "Blueberry"],
  ["Cabbage", "Carrot", "Cherry"],
  ["Date", "Dragon fruit"],
  ["Edamame", "Eggplant", "Elderberry"],
  ["Fennel", "Fig"],
  ["Garlic", "Grape", "Grapefruit"],
  ["Honeydew", "Horseradish"],
  ["Iceberg lettuce"],
  ["Jackfruit", "Jalapeño"],
  ["Kale", "Kiwi"],
  ["Leek", "Lemon", "Lime"],
  ["Mango", "Melon", "Mushroom"],
  ["Nectarine"],
  ["Okra", "Onion", "Orange"],
  ["Peach", "Pear", "Plum"],
  ["Quince"],
  ["Radish", "Raspberry", "Rhubarb"],
  ["Spinach", "Squash", "Strawberry"],
  ["Tangerine", "Tomato", "Turnip"],
  ["Ugli fruit"],
  ["Vanilla bean"],
  ["Watercress", "Watermelon"],
  ["Xigua"],
  ["Yam", "Yuzu"],
  ["Zucchini"],
];
const groups = [
  ...produce.map((names, i) => ({ label: String.fromCharCode(65 + i), names })),
  { label: "#", names: ["100% cocoa"] },
];
const barHeight = 60;
const sectionHeight = 36;
const edgeTail = 24;
const s = stylex.create({
  root: {
    height: 600,
    maxWidth: 430,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "var(--lenso-background-primary)",
    borderRadius: 16,
    fontFamily: "var(--lenso-font-body)",
    "--section-label": "light-dark(var(--lenso-label-secondary), rgb(235 235 245 / .6))",
    "--section-hairline": {
      default: "1px",
      "@media (min-resolution: 2dppx)": ".5px",
      "@media (min-resolution: 3dppx)": ".333333px",
    },
  },
  scroll: {
    position: "relative",
    boxSizing: "border-box",
    height: "100%",
    overflowY: "auto",
    overscrollBehaviorY: "contain",
    paddingBlockStart: barHeight,
    paddingBlockEnd: 16,
    scrollbarWidth: "none",
    scrollBehavior: "auto",
  },
  navigation: { position: "absolute", top: 0, zIndex: 3 },
  edge: { top: 0, height: barHeight + edgeTail, zIndex: 1 },
  extendedEdge: { height: barHeight + sectionHeight + edgeTail },
  index: {
    position: "absolute",
    insetInlineEnd: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 4,
  },
  heading: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    height: sectionHeight,
    boxSizing: "border-box",
    color: "var(--section-label)",
    fontSize: 17,
    fontWeight: 600,
    lineHeight: "22px",
    margin: 0,
    paddingInline: 16,
    "::after": {
      content: '""',
      position: "absolute",
      insetInline: 16,
      bottom: 0,
      height: 1,
      backgroundColor: "var(--lenso-separator)",
    },
  },
  obscuredHeading: { opacity: 0 },
  pinned: {
    position: "absolute",
    top: barHeight,
    insetInline: 0,
    height: sectionHeight,
    overflow: "clip",
    zIndex: 2,
    pointerEvents: "none",
    "::after": {
      content: '""',
      position: "absolute",
      insetInline: 0,
      bottom: 0,
      height: "var(--section-hairline)",
      backgroundColor: "var(--lenso-separator)",
      opacity: 0.75,
    },
  },
  pinnedTitle: (offset: number) => ({ transform: `translateY(${offset}px)` }),
  noDivider: { "::after": { display: "none" } },
  row: {
    minHeight: 77,
    borderRadius: 0,
    gap: 16,
    paddingBlock: 16,
    paddingInline: 16,
    "::after": {
      content: { default: '""', ":last-child": "none" },
      position: "absolute",
      bottom: 0,
      insetInlineStart: 77,
      insetInlineEnd: 16,
      height: 1,
      backgroundColor: "var(--lenso-separator)",
    },
  },
  content: { paddingBlock: 0 },
  avatar: { width: 45, height: 45, borderRadius: 1000 },
  initial: { fontSize: 26, lineHeight: "32px", fontWeight: 500 },
});
export interface SectionIndexStoryProps {
  disabled: boolean;
}
export function SectionIndexStory({ disabled }: SectionIndexStoryProps) {
  const id = useId();
  const scroll = useRef<HTMLDivElement>(null);
  const headings = useRef(new Map<string, HTMLHeadingElement>());
  const [location, setLocation] = useState({ value: "A", pinned: false, offset: 0 });
  return (
    <div {...stylex.props(s.root)}>
      <div
        ref={scroll}
        data-slot="section-index-viewport"
        {...stylex.props(s.scroll)}
        onScroll={(event) => {
          const viewport = event.currentTarget;
          let active = 0;
          for (const [index, group] of groups.entries()) {
            const heading = headings.current.get(group.label);
            if (heading && heading.parentElement!.offsetTop <= viewport.scrollTop + barHeight + 1)
              active = index;
          }
          const next = groups[active + 1];
          const nextTop = next
            ? headings.current.get(next.label)!.parentElement!.offsetTop
            : Infinity;
          const value = groups[active]!.label;
          const pinned = viewport.scrollTop > 0;
          const offset = Math.min(0, nextTop - viewport.scrollTop - barHeight - sectionHeight);
          setLocation((previous) =>
            previous.value === value && previous.pinned === pinned && previous.offset === offset
              ? previous
              : { value, pinned, offset },
          );
        }}
      >
        {groups.map((group) => (
          <section key={group.label} aria-labelledby={`${id}-${group.label}`}>
            <h3
              id={`${id}-${group.label}`}
              ref={(node) => {
                if (node) headings.current.set(group.label, node);
                else headings.current.delete(group.label);
              }}
              {...stylex.props(
                s.heading,
                location.pinned && group.label === location.value && s.obscuredHeading,
              )}
            >
              {group.label}
            </h3>
            <List variant="plain">
              {group.names.map((name) => (
                <List.Item key={name} xstyle={s.row}>
                  <List.Leading>
                    <Avatar xstyle={s.avatar} aria-hidden="true">
                      <Avatar.Fallback xstyle={s.initial}>{name[0]}</Avatar.Fallback>
                    </Avatar>
                  </List.Leading>
                  <List.Content xstyle={s.content}>
                    <List.Title>{name}</List.Title>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </section>
        ))}
      </div>
      <ScrollEdge
        variant="soft"
        scrollRef={scroll}
        fadeStart={barHeight + (location.pinned ? sectionHeight : 0)}
        xstyle={[s.edge, location.pinned && s.extendedEdge]}
      />
      <NavigationBar title="Produce" large={false} edge="none" xstyle={s.navigation} />
      {location.pinned && (
        <div
          aria-hidden="true"
          data-slot="section-index-sticky-heading"
          {...stylex.props(s.pinned)}
        >
          <div {...stylex.props(s.heading, s.noDivider, s.pinnedTitle(location.offset))}>
            {location.value}
          </div>
        </div>
      )}
      <SectionIndex
        aria-label="Produce sections"
        items={groups.map((group) => ({
          value: group.label,
          label: group.label,
          href: `#${id}-${group.label}`,
        }))}
        value={location.value}
        onClick={(event) => {
          // This preview owns its scrollport; fragment navigation would also move the docs page.
          if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey)
            event.preventDefault();
        }}
        onValueChange={(next) => {
          const section = headings.current.get(next)?.parentElement;
          if (scroll.current && section)
            scroll.current.scrollTo({ top: section.offsetTop - barHeight, behavior: "instant" });
        }}
        disabled={disabled}
        xstyle={s.index}
      />
    </div>
  );
}
