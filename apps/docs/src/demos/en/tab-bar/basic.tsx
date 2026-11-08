"use client";

import { useRef, useState } from "react";
import { Clock, Folder, Heart, House, Magnifier } from "@gravity-ui/icons";
import { Button, TabBar, type TabBarLayout, type TabBarRootProps } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const s = stylex.create({
  preview: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    width: "100%",
    minWidth: 0,
  },
  phone: { width: "100%", maxWidth: 400 },
  tablet: { maxWidth: "100%" },
  output: { color: "var(--lenso-label-primary)", fontSize: 14, minHeight: 20 },
  scrollArea: {
    boxSizing: "border-box",
    width: "100%",
    maxWidth: 400,
    height: 160,
    overflowY: "auto",
    padding: "12px 16px",
    borderRadius: 16,
    backgroundColor: "var(--lenso-background-secondary)",
    color: "var(--lenso-label-primary)",
    fontSize: 14,
  },
  scrollHint: { margin: "0 0 8px", color: "var(--lenso-label-secondary)" },
  scrollRow: { display: "flex", alignItems: "center", minHeight: 52 },
});

const destinations = [
  { id: "home", en: "Home", cn: "首页", Icon: House },
  { id: "library", en: "Library", cn: "资料库", Icon: Folder },
  { id: "recent", en: "Recent", cn: "最近", Icon: Clock },
  { id: "favorites", en: "Favorites", cn: "收藏", Icon: Heart },
] as const;

export interface TabBarExampleProps {
  layout?: TabBarLayout;
  showSearch?: boolean;
  locale?: "en" | "cn";
  elastic?: TabBarRootProps["elastic"];
  lift?: TabBarRootProps["lift"];
  autoMinimize?: TabBarRootProps["autoMinimize"];
  minimized?: TabBarRootProps["minimized"];
  onMinimizedChange?: TabBarRootProps["onMinimizedChange"];
}

export function TabBarExample({
  layout = "phone",
  showSearch = true,
  locale = "en",
  elastic = true,
  lift = 20,
  autoMinimize = false,
  minimized: controlledMinimized,
  onMinimizedChange,
}: TabBarExampleProps) {
  const scrollTarget = useRef<HTMLElement | null>(null);
  const [current, setCurrent] = useState<string>("home");
  const [localMinimized, setLocalMinimized] = useState(false);
  const minimized = controlledMinimized ?? localMinimized;
  const setMinimized = onMinimizedChange ?? setLocalMinimized;
  const search = locale === "cn" ? "搜索" : "Search";
  const searchLink = (
    <TabBar.Link
      href="#tab-bar-search"
      isCurrent={current === "search"}
      icon={<Magnifier width="100%" height="100%" />}
      iconOnly
      onClick={(event) => {
        event.preventDefault();
        setCurrent("search");
      }}
    >
      {search}
    </TabBar.Link>
  );
  const selected = destinations.find((item) => item.id === current);
  return (
    <div {...stylex.props(s.preview)}>
      {autoMinimize && (
        <section
          ref={scrollTarget}
          aria-label={locale === "cn" ? "滚动示例内容" : "Scrollable example content"}
          // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keyboard users need to scroll this region.
          tabIndex={0}
          {...stylex.props(s.scrollArea)}
        >
          <p {...stylex.props(s.scrollHint)}>
            {locale === "cn"
              ? autoMinimize === "up"
                ? "向上滚动收起导航，向下滚动展开。"
                : "向下滚动收起导航，向上滚动展开。"
              : autoMinimize === "up"
                ? "Scroll up to minimize, down to expand."
                : "Scroll down to minimize, up to expand."}
          </p>
          {destinations.map(({ id, en, cn }) => (
            <div key={id} {...stylex.props(s.scrollRow)}>
              {locale === "cn" ? cn : en}
            </div>
          ))}
        </section>
      )}
      <TabBar
        aria-label={locale === "cn" ? "主导航" : "Main navigation"}
        layout={layout}
        elastic={elastic}
        lift={lift}
        autoMinimize={autoMinimize}
        scrollTarget={autoMinimize ? scrollTarget : undefined}
        minimized={minimized}
        onMinimizedChange={setMinimized}
        expandLabel={locale === "cn" ? "展开导航" : "Expand navigation"}
        xstyle={layout === "phone" ? s.phone : s.tablet}
      >
        <TabBar.Group>
          {destinations.map(({ id, en, cn, Icon }) => (
            <TabBar.Link
              key={id}
              href={`#tab-bar-${id}`}
              isCurrent={current === id}
              icon={<Icon width="100%" height="100%" />}
              onClick={(event) => {
                event.preventDefault();
                setCurrent(id);
              }}
            >
              {locale === "cn" ? cn : en}
            </TabBar.Link>
          ))}
          {layout === "tablet" && showSearch && searchLink}
        </TabBar.Group>
        {layout === "phone" && showSearch && <TabBar.Group separate>{searchLink}</TabBar.Group>}
      </TabBar>
      <Button
        size="sm"
        variant="borderless"
        aria-expanded={!minimized}
        onClick={() => setMinimized(!minimized)}
      >
        {minimized
          ? locale === "cn"
            ? "展开导航"
            : "Expand navigation"
          : locale === "cn"
            ? "收起导航"
            : "Minimize navigation"}
      </Button>
      <output aria-live="polite" {...stylex.props(s.output)}>
        {locale === "cn" ? "当前：" : "Current: "}
        {selected ? selected[locale] : search}
      </output>
    </div>
  );
}

export function Basic() {
  return <TabBarExample />;
}
