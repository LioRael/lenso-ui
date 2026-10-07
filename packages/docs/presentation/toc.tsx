"use client";

import { useEffect, useRef, useState } from "react";
import { TOCItem as Anchor, useActiveAnchor, useActiveAnchors } from "fumadocs-core/toc";
import { TOCProvider, TOCScrollArea } from "fumadocs-ui/components/toc";
import * as stylex from "@stylexjs/stylex";
import { ChevronDown, TextAlignLeft } from "@gravity-ui/icons";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "fumadocs-ui/components/ui/collapsible";
import { styles } from "./styles/docs.stylex";
import { notebook } from "./styles/notebook.stylex";

export interface TOCItem {
  title: string;
  id: string;
  depth: number;
}

// HeroUI e385ac2 notebook/page (Apache-2.0) and Fumadocs core/UI 16.9.0
// (MIT; ../LICENSE.FUMADOCS). Fuma owns heading observation and anchor state;
// the retained visual rail/resize adapter keeps HeroUI's responsive geometry.
function TOCLinks({
  items,
  active,
  current,
  label,
  close,
}: {
  items: TOCItem[];
  active: string[];
  current?: string | undefined;
  label: string;
  close: () => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const nav = container.current;
    const indicator = thumb.current;
    if (!nav || !indicator) return;
    const update = () => {
      if (nav.clientHeight === 0 || active.length === 0) {
        indicator.style.setProperty("--fd-top", "0px");
        indicator.style.setProperty("--fd-height", "0px");
        return;
      }
      const links = [...nav.querySelectorAll<HTMLAnchorElement>('[data-active="true"]')];
      const upper = Math.min(
        ...links.map((link) => link.offsetTop + parseFloat(getComputedStyle(link).paddingTop)),
      );
      const lower = Math.max(
        ...links.map(
          (link) =>
            link.offsetTop + link.clientHeight - parseFloat(getComputedStyle(link).paddingBottom),
        ),
      );
      indicator.style.setProperty("--fd-top", `${links.length ? upper : 0}px`);
      indicator.style.setProperty("--fd-height", `${links.length ? lower - upper : 0}px`);
    };
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    update();
    return () => observer.disconnect();
  }, [active]);
  useEffect(() => {
    const view = viewport.current;
    const link = [...(container.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])].find(
      (anchor) =>
        anchor.hash === `#${current}` || anchor.hash === `#${encodeURIComponent(current ?? "")}`,
    );
    if (!view || !link) return;
    let width = view.clientWidth;
    let height = view.clientHeight;
    const alignAfterResize = () => {
      if (view.clientWidth === width && view.clientHeight === height) return;
      width = view.clientWidth;
      height = view.clientHeight;
      if (view.clientHeight === 0 || view.clientWidth === 0 || link.clientHeight === 0) return;
      const bounds = view.getBoundingClientRect();
      const anchor = link.getBoundingClientRect();
      if (anchor.top >= bounds.top + 16 && anchor.bottom <= bounds.bottom - 16) return;
      view.scrollTo({
        top: view.scrollTop + anchor.top - bounds.top - (view.clientHeight - anchor.height) / 2,
        behavior: "instant",
      });
    };
    // Both responsive TOCs stay mounted: an unchanged heading must become visible
    // when its viewport appears or shrinks, without scrolling the document itself.
    const observer = new ResizeObserver(alignAfterResize);
    observer.observe(view);
    return () => observer.disconnect();
  }, [current, items]);
  return (
    <TOCScrollArea ref={viewport} {...stylex.props(notebook.tocViewport)}>
      <div {...stylex.props(notebook.tocItems)}>
        <div
          ref={thumb}
          aria-hidden="true"
          data-hidden={active.length === 0}
          {...stylex.props(notebook.tocThumb)}
        />
        <nav ref={container} aria-label={label} {...stylex.props(notebook.tocNavigation)}>
          {items.map((item, index) => (
            <Anchor
              key={`${item.id}-${index}`}
              href={`#${item.id}`}
              data-active={active.includes(item.id)}
              aria-current={current === item.id ? "location" : undefined}
              onClick={close}
              {...stylex.props(
                notebook.tocLink,
                item.depth === 3 && notebook.tocNested,
                item.depth >= 4 && notebook.tocDeep,
                active.includes(item.id) && notebook.tocActive,
              )}
            >
              {item.title}
            </Anchor>
          ))}
        </nav>
      </div>
    </TOCScrollArea>
  );
}

export function PageTableOfContents({
  items,
  locale,
  title,
}: {
  items: TOCItem[];
  locale: string;
  title: string;
}) {
  return (
    <TOCProvider
      toc={items.map((item) => ({ title: item.title, url: `#${item.id}`, depth: item.depth }))}
    >
      <PageTOC items={items} locale={locale} title={title} />
    </TOCProvider>
  );
}

function PageTOC({ items, locale, title }: { items: TOCItem[]; locale: string; title: string }) {
  const active = useActiveAnchors();
  const current = useActiveAnchor();
  const [open, setOpen] = useState(false);
  const mobile = useRef<HTMLDivElement>(null);
  const label = locale === "cn" ? "本页内容" : "On this page";
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !mobile.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);
  const links = (
    <TOCLinks
      items={items}
      active={active}
      current={current}
      label={label}
      close={() => setOpen(false)}
    />
  );
  if (items.length === 0) return null;
  const selected = Math.max(
    0,
    items.findIndex((item) => item.id === current),
  );
  const circumference = 2 * Math.PI * 11;
  return (
    <>
      <Collapsible
        ref={mobile}
        open={open}
        onOpenChange={setOpen}
        data-docs-toc-mobile=""
        {...stylex.props(notebook.tocMobile)}
      >
        <div {...stylex.props(notebook.tocHeader)}>
          <CollapsibleTrigger aria-label={label} {...stylex.props(notebook.tocTrigger)}>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx={12} cy={12} r={11} stroke="currentColor" strokeWidth={2} opacity={0.25} />
              <circle
                cx={12}
                cy={12}
                r={11}
                stroke="currentColor"
                strokeWidth={2}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - (selected + 1) / items.length)}
                strokeLinecap="round"
                transform="rotate(-90 12 12)"
              />
            </svg>
            <span {...stylex.props(notebook.searchLabel)}>
              {open ? title : items[selected]?.title}
            </span>
            <ChevronDown
              width={16}
              height={16}
              aria-hidden="true"
              {...stylex.props(notebook.tocChevron, open && notebook.tocChevronOpen)}
            />
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent {...stylex.props(notebook.tocContent)}>{links}</CollapsibleContent>
      </Collapsible>
      <aside id="nd-toc" aria-label={label} {...stylex.props(styles.toc)}>
        <h3 {...stylex.props(notebook.tocTitle)}>
          <TextAlignLeft width={16} height={16} aria-hidden="true" /> {label}
        </h3>
        {links}
      </aside>
    </>
  );
}
