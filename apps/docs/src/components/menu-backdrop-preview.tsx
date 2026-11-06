"use client";
import { useCallback, useRef, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { Tabs } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { GlassBackdropSourceContext } from "@lenso/glass/react";
import { menuBackdrop } from "../lib/menu-backdrop/source";
export function MenuBackdropPreview(props: ComponentPropsWithoutRef<"div">) {
  const example = useRef<HTMLDivElement>(null);
  const source = useCallback(
    (lens: HTMLElement) => (example.current ? menuBackdrop(example.current, lens) : undefined),
    [],
  );
  return (
    <GlassBackdropSourceContext value={source}>
      <div {...props} ref={example} />
    </GlassBackdropSourceContext>
  );
}

const s = stylex.create({
  root: {
    width: "100%",
    minWidth: 0,
    gap: 8,
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

export function MenuExampleFrame({
  preview,
  source,
  locale,
  name,
}: {
  preview: ReactNode;
  source?: ReactNode;
  locale: "en" | "cn";
  name: string;
}) {
  if (!source) return preview;
  const cn = locale === "cn";
  return (
    <Tabs defaultValue="preview" xstyle={s.root}>
      <Tabs.List aria-label={cn ? `${name} 示例视图` : `${name} example view`} xstyle={s.list}>
        <Tabs.Tab value="preview" xstyle={s.tab}>
          {cn ? "预览" : "Preview"}
        </Tabs.Tab>
        <Tabs.Tab value="source" xstyle={s.tab}>
          {cn ? "源码" : "Source"}
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="preview" xstyle={s.panel}>
        {preview}
      </Tabs.Panel>
      <Tabs.Panel value="source" xstyle={s.panel}>
        {source}
      </Tabs.Panel>
    </Tabs>
  );
}
