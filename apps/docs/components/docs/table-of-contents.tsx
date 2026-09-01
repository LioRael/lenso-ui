"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import type { DocsPage } from "../../contents/catalog";

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

export function TableOfContents({ page }: { page: DocsPage }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [indicatorPosition, setIndicatorPosition] = useState<IndicatorPosition | undefined>();
  const clickedId = useRef<string | undefined>(undefined);
  const itemRefs = useRef(new Map<string, HTMLAnchorElement>());
  const itemsRef = useRef<HTMLDivElement>(null);
  const unlockTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const documentMain = document.querySelector<HTMLElement>(`[data-document-main="${page}"]`);
    const scrollRoot = documentMain?.closest<HTMLElement>(".docs-scroll");

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

  return (
    <aside aria-label="On this page" className="document-toc">
      <p className="document-toc-label">ON THIS PAGE</p>
      <nav aria-label="Table of contents">
        <div className="document-toc-items" ref={itemsRef}>
          <span
            aria-hidden="true"
            className={["document-toc-indicator", indicatorPosition ? "is-ready" : ""]
              .filter(Boolean)
              .join(" ")}
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
                className={["document-toc-item", active ? "is-active" : ""]
                  .filter(Boolean)
                  .join(" ")}
                href={`#${item.id}`}
                key={item.id}
                onClick={() => {
                  clickedId.current = item.id;
                  setActiveId(item.id);
                  if (unlockTimer.current) window.clearTimeout(unlockTimer.current);
                  unlockTimer.current = window.setTimeout(() => {
                    clickedId.current = undefined;
                    unlockTimer.current = undefined;
                  }, 800);
                }}
                ref={(element) => {
                  if (element) {
                    itemRefs.current.set(item.id, element);
                  } else {
                    itemRefs.current.delete(item.id);
                  }
                }}
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
