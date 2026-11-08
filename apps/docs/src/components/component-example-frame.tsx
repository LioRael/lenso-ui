"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { GlassBackdropSourceContext } from "@lenso/glass/react";
import { menuBackdrop } from "../lib/menu-backdrop/source";
import { Tabs } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const s = stylex.create({
  root: {
    width: "100%",
    minWidth: 0,
    gap: 8,
  },
  listContainer: {
    margin: 0,
  },
  list: {
    "--lg-tab-width": "88px",
    "--lg-tab-height": { default: "36px", "@media (pointer: coarse)": "44px" },
  },
  tab: {
    fontSize: 13,
    fontWeight: { default: 500, ":is([aria-selected='true'])": 600 },
    color: "var(--lenso-label-primary)",
  },
  panel: { margin: 0, marginTop: 0, padding: 0, minWidth: 0 },
});

export function ScrollableExampleScene({
  registerMenuBackdrop,
  ...props
}: ComponentPropsWithoutRef<"section"> & { registerMenuBackdrop?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [scrollable, setScrollable] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () =>
      setScrollable(
        node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1,
      );
    let frame = 0;
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(node);
    for (const child of node.children) resize.observe(child);
    const mutation = new MutationObserver(schedule);
    mutation.observe(node, { childList: true, subtree: true });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);
  const source = useCallback(
    (element: HTMLElement) => (ref.current ? menuBackdrop(ref.current, element) : undefined),
    [],
  );
  const scene = (
    <section {...props} ref={ref} tabIndex={props.tabIndex ?? (scrollable ? 0 : undefined)} />
  );
  return registerMenuBackdrop ? (
    <GlassBackdropSourceContext value={source}>{scene}</GlassBackdropSourceContext>
  ) : (
    scene
  );
}

export function ComponentExampleFrame({
  preview,
  source,
  locale,
  name,
  defaultView = "preview",
}: {
  preview: ReactNode;
  source?: ReactNode;
  locale: "en" | "cn";
  name: string;
  defaultView?: "preview" | "source";
}) {
  if (!source) return preview;
  const cn = locale === "cn";
  return (
    <Tabs defaultValue={defaultView} lift={0} xstyle={s.root}>
      <Tabs.ListContainer xstyle={s.listContainer}>
        <Tabs.List aria-label={cn ? `${name} 示例视图` : `${name} example view`} xstyle={s.list}>
          <Tabs.Tab value="preview" xstyle={s.tab}>
            {cn ? "预览" : "Preview"}
          </Tabs.Tab>
          <Tabs.Tab value="source" xstyle={s.tab}>
            {cn ? "源码" : "Source"}
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel value="preview" xstyle={s.panel}>
        {preview}
      </Tabs.Panel>
      <Tabs.Panel value="source" xstyle={s.panel}>
        {source}
      </Tabs.Panel>
    </Tabs>
  );
}
