"use client";

import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import Link from "fumadocs-core/link";
import { useTreePath } from "fumadocs-ui/contexts/tree";
import { useFooterItems } from "fumadocs-ui/utils/use-footer-items";
import { useDocumentationMessages } from "./i18n";
import type { FooterProps } from "fumadocs-ui/layouts/notebook/page/slots/footer";
import { notebook } from "@lenso/docs/presentation";

export { ThemeToggle as DocumentationThemeSwitch } from "./theme-toggle";

export function DocumentationFooter({ items }: FooterProps): ReactNode {
  const pages = useFooterItems();
  const path = useTreePath();
  const current = path.at(-1);
  const position = pages.findIndex(
    (page) => page.url === (current?.type === "page" ? current.url : undefined),
  );
  const previous = items?.previous ?? (position >= 0 ? pages[position - 1] : undefined);
  const next = items?.next ?? (position >= 0 ? pages[position + 1] : undefined);
  const messages = useDocumentationMessages();
  if (!previous && !next) return null;
  return (
    <nav
      aria-label={messages.adjacentPages}
      {...stylex.props(notebook.pageFooter, !(previous && next) && notebook.footerSingle)}
    >
      {previous && (
        <Link href={previous.url} {...stylex.props(notebook.footerLink)}>
          <span {...stylex.props(notebook.footerTitle)}>
            <ChevronLeft
              width={16}
              height={16}
              aria-hidden="true"
              {...stylex.props(notebook.footerIcon)}
            />
            {previous.name}
          </span>
          <span {...stylex.props(notebook.footerDescription)}>
            {previous.description ?? messages.previousPage}
          </span>
        </Link>
      )}
      {next && (
        <Link href={next.url} {...stylex.props(notebook.footerLink, notebook.footerNext)}>
          <span {...stylex.props(notebook.footerTitle, notebook.footerTitleNext)}>
            <ChevronRight
              width={16}
              height={16}
              aria-hidden="true"
              {...stylex.props(notebook.footerIcon)}
            />
            {next.name}
          </span>
          <span {...stylex.props(notebook.footerDescription)}>
            {next.description ?? messages.nextPage}
          </span>
        </Link>
      )}
    </nav>
  );
}
