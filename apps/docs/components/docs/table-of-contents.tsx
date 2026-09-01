"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import * as stylex from "@stylexjs/stylex";
import { ChevronDownIcon } from "lucide-react";

import type { DocsPage } from "../../contents/catalog";
import { styles } from "./table-of-contents.stylex";

interface TocItem {
  id: string;
  label: string;
}

interface IndicatorPosition {
  height: number;
  y: number;
}

function findActiveHeading(headings: HTMLElement[], scrollRoot: HTMLElement): string | undefined {
  const threshold = scrollRoot.getBoundingClientRect().top + 72;
  const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= threshold);
  return (passed.at(-1) ?? headings[0])?.id;
}

export function TableOfContents({ mobile = false, page }: { mobile?: boolean; page: DocsPage }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [indicatorPosition, setIndicatorPosition] = useState<IndicatorPosition | undefined>();
  const clickedId = useRef<string | undefined>(undefined);
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
  const itemsRef = useRef<HTMLDivElement>(null);
  const unlockTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const documentMain = document.querySelector<HTMLElement>(`[data-document-main="${page}"]`);
    const scrollRoot = documentMain?.closest<HTMLElement>("[data-docs-scroll]");

    if (!documentMain || !scrollRoot) return;

    const headings = Array.from(documentMain.querySelectorAll<HTMLElement>("[data-toc-heading]"));
    const nextItems = headings.flatMap((heading) => {
      const label = heading.textContent?.trim();
      if (!label || !heading.id) return [];
      return [{ id: heading.id, label }];
    });

    setItems(nextItems);
    setActiveId(findActiveHeading(headings, scrollRoot));

    const updateActiveHeading = () => {
      if (clickedId.current) return;
      setActiveId(findActiveHeading(headings, scrollRoot));
    };

    scrollRoot.addEventListener("scroll", updateActiveHeading, { passive: true });
    window.addEventListener("resize", updateActiveHeading);

    return () => {
      scrollRoot.removeEventListener("scroll", updateActiveHeading);
      window.removeEventListener("resize", updateActiveHeading);
      if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    };
  }, [page]);

  useEffect(() => {
    const itemsElement = itemsRef.current;
    const activeItem = activeId ? itemRefs.current.get(activeId) : undefined;

    if (!itemsElement || !activeItem) {
      setIndicatorPosition(undefined);
      return;
    }

    const updateIndicatorPosition = () => {
      const itemsRect = itemsElement.getBoundingClientRect();
      const itemRect = activeItem.getBoundingClientRect();
      const height = Math.min(16, itemRect.height);
      const y = itemRect.top - itemsRect.top + (itemRect.height - height) / 2;

      setIndicatorPosition((current) =>
        current && current.y === y && current.height === height ? current : { height, y },
      );
    };

    updateIndicatorPosition();

    const resizeObserver = new ResizeObserver(updateIndicatorPosition);
    resizeObserver.observe(itemsElement);
    resizeObserver.observe(activeItem);
    window.addEventListener("resize", updateIndicatorPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateIndicatorPosition);
    };
  }, [activeId, items]);

  const registerItem = (id: string, element: HTMLAnchorElement | null) => {
    if (element) itemRefs.current.set(id, element);
    else itemRefs.current.delete(id);
  };

  const selectItem = (id: string) => {
    clickedId.current = id;
    setActiveId(id);
    if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
    unlockTimer.current = window.setTimeout(() => {
      clickedId.current = undefined;
      unlockTimer.current = undefined;
    }, 800);
  };

  if (mobile) {
    return (
      <details {...stylex.props(styles.mobileRoot)}>
        <summary {...stylex.props(styles.mobileSummary)}>
          <span>On this page</span>
          <ChevronDownIcon aria-hidden="true" {...stylex.props(styles.mobileChevron)} />
        </summary>
        <nav aria-label="Table of contents" {...stylex.props(styles.mobileNavigation)}>
          <div {...stylex.props(styles.mobileItems)} ref={itemsRef}>
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <a
                  aria-current={active ? "location" : undefined}
                  {...stylex.props(styles.mobileItem, active && styles.activeMobileItem)}
                  href={`#${item.id}`}
                  key={item.id}
                  onClick={() => selectItem(item.id)}
                  ref={(element) => registerItem(item.id, element)}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </nav>
      </details>
    );
  }

  return (
    <aside aria-label="On this page" {...stylex.props(styles.root, styles.desktopRoot)}>
      <p {...stylex.props(styles.label)}>ON THIS PAGE</p>
      <nav aria-label="Table of contents">
        <div {...stylex.props(styles.items)} ref={itemsRef}>
          <span
            aria-hidden="true"
            {...stylex.props(styles.indicator, indicatorPosition && styles.readyIndicator)}
            style={
              indicatorPosition
                ? ({
                    height: `${indicatorPosition.height}px`,
                    transform: `translateY(${indicatorPosition.y}px)`,
                  } as CSSProperties)
                : undefined
            }
          />
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <a
                aria-current={active ? "location" : undefined}
                {...stylex.props(styles.item, active && styles.activeItem)}
                href={`#${item.id}`}
                key={item.id}
                onClick={() => selectItem(item.id)}
                ref={(element) => registerItem(item.id, element)}
              >
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
