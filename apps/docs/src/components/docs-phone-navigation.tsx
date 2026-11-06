"use client";

import { useEffect, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import Link from "next/link";
import { Magnifier } from "@gravity-ui/icons";
import { useGlassRef } from "@lenso/glass/react";
import { liquidMaterialStyles } from "@lenso/tokens/materials";
import { DocumentationButton, type DocumentationSiteLayoutProps } from "@lenso/docs/client";
import { headerControls as s } from "@/styles/header-controls.stylex";

const phone = stylex.create({
  bar: { alignItems: "center", justifyContent: "center", gap: 8, pointerEvents: "none" },
  group: {
    pointerEvents: "auto",
    display: "flex",
    alignItems: "center",
    position: "relative",
    isolation: "isolate",
    borderRadius: 40,
    padding: 4,
    minWidth: 0,
    backgroundColor: "var(--lenso-control-field-fill)",
  },
  link: {
    display: "flex",
    flex: "1 1 auto",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
    minHeight: 44,
    paddingInline: 10,
    borderRadius: 32,
    fontSize: 11,
    lineHeight: "14px",
    color: {
      default: "var(--lenso-label-secondary)",
      ":is([aria-current='page'])": "var(--lenso-tint-text)",
    },
    backgroundColor: {
      default: "transparent",
      ":is([aria-current='page'])": "var(--lenso-control-fill)",
    },
    textDecoration: "none",
    outline: { default: "none", ":focus-visible": "2px solid var(--lenso-focus-ring)" },
  },
  search: { pointerEvents: "auto", width: 48, height: 48, minWidth: 48, borderRadius: 32 },
});

export function DocsPhoneNavigation({
  sections,
  activeSection,
  locale,
  onSearch,
}: {
  sections: DocumentationSiteLayoutProps["sections"];
  activeSection: string;
  locale: "en" | "cn";
  onSearch: () => void;
}) {
  const [compact, setCompact] = useState(false);
  const ref = useGlassRef<HTMLDivElement>(undefined, true);
  useEffect(() => {
    let last = window.scrollY;
    function scroll() {
      const next = window.scrollY;
      if (Math.abs(next - last) < 8) return;
      setCompact(next > 80 && next > last);
      last = next;
    }
    window.addEventListener("scroll", scroll, { passive: true });
    return () => window.removeEventListener("scroll", scroll);
  }, []);
  const current = sections.find((section) => section.id === activeSection);
  const searchLabel = locale === "cn" ? "搜索文档" : "Search documentation";
  return (
    <nav
      aria-label={locale === "cn" ? "文档导航" : "Documentation navigation"}
      data-minimized={compact && current ? "" : undefined}
      {...stylex.props(s.phoneNavigation, phone.bar)}
    >
      {compact && current ? (
        <DocumentationButton
          isIconOnly
          aria-label={locale === "cn" ? "展开导航" : "Expand navigation"}
          onClick={() => setCompact(false)}
          xstyle={phone.search}
        >
          {current.icon}
        </DocumentationButton>
      ) : (
        <div ref={ref} {...stylex.props(liquidMaterialStyles.small, phone.group)}>
          {sections.map((section) => (
            <Link
              key={section.id}
              href={section.url}
              aria-current={section.id === activeSection ? "page" : undefined}
              {...stylex.props(phone.link)}
            >
              {section.icon}
              <span>{section.title}</span>
            </Link>
          ))}
        </div>
      )}
      <DocumentationButton
        isIconOnly
        aria-label={searchLabel}
        data-docs-search-trigger=""
        onClick={onSearch}
        xstyle={phone.search}
      >
        <Magnifier aria-hidden="true" width={18} height={18} />
      </DocumentationButton>
    </nav>
  );
}
