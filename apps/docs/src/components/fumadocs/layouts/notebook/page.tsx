"use client";

import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ChevronDown, TextAlignLeft } from "@gravity-ui/icons";
import { Disclosure } from "@lenso/ui";
import { styles } from "@/styles/docs.stylex";
import { notebook } from "@/styles/notebook.stylex";

export interface TOCItem {
  title: string;
  id: string;
  depth: number;
}

// Source: notebook/page and toc-items (HeroUI v3.2.6, Apache-2.0).
export function PageTableOfContents({ items, locale }: { items: TOCItem[]; locale: string }) {
  const [active, setActive] = useState(items[0]?.id);
  const [open, setOpen] = useState(false);
  const label = locale === "cn" ? "本页内容" : "On this page";
  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element) => element !== null);
    const update = () => {
      const above = elements.filter((element) => element.getBoundingClientRect().top <= 170);
      setActive((above.at(-1) ?? elements[0])?.id);
    };
    const observer = new IntersectionObserver(update, { rootMargin: "-140px 0px -60% 0px" });
    elements.forEach((element) => observer.observe(element));
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, [items]);
  const links = (
    <nav aria-label={label} {...stylex.props(notebook.tocNavigation)}>
      {items.map((item, index) => (
        <a
          key={`${item.id}-${index}`}
          href={`#${item.id}`}
          aria-current={active === item.id ? "location" : undefined}
          onClick={() => setOpen(false)}
          {...stylex.props(
            notebook.tocLink,
            item.depth > 2 && notebook.tocNested,
            active === item.id && notebook.tocActive,
          )}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
  if (items.length === 0) return null;
  const selected = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  );
  const circumference = 2 * Math.PI * 11;
  return (
    <>
      <Disclosure.Root open={open} onOpenChange={setOpen} xstyle={notebook.tocMobile}>
        <Disclosure.Trigger aria-label={label} xstyle={notebook.tocTrigger}>
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
              transform="rotate(-90 12 12)"
            />
          </svg>
          <span {...stylex.props(notebook.searchLabel)}>
            {open ? label : items[selected]?.title}
          </span>
          <ChevronDown width={16} height={16} aria-hidden="true" />
        </Disclosure.Trigger>
        <Disclosure.Content xstyle={notebook.tocContent}>{links}</Disclosure.Content>
      </Disclosure.Root>
      <aside id="nd-toc" aria-label={label} {...stylex.props(styles.toc)}>
        <h2 {...stylex.props(notebook.tocTitle)}>
          <TextAlignLeft width={16} height={16} aria-hidden="true" /> {label}
        </h2>
        {links}
      </aside>
    </>
  );
}
