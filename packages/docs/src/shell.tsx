"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { ChevronLeft, ChevronRight, Sun, Moon, Display } from "@gravity-ui/icons";
import Link from "fumadocs-core/link";
import { useTheme } from "fumadocs-ui/provider/base";
import { useTreePath } from "fumadocs-ui/contexts/tree";
import { useFooterItems } from "fumadocs-ui/utils/use-footer-items";
import { useTranslations } from "fumadocs-ui/contexts/i18n";
import type { FooterProps } from "fumadocs-ui/layouts/notebook/page/slots/footer";
import { notebook } from "../dist/presentation.js";

const subscribeTheme = () => () => {};
const themeOptions = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Display],
] as const;

export function DocumentationThemeSwitch(): ReactNode {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeTheme,
    () => true,
    () => false,
  );
  return (
    <ToggleGroup
      aria-label="Color theme"
      value={mounted && theme ? [theme] : []}
      onValueChange={(values) => {
        if (values[0]) setTheme(values[0]);
      }}
      {...stylex.props(notebook.themeGroup)}
    >
      {themeOptions.map(([value, Icon]) => (
        <Toggle
          key={value}
          value={value}
          aria-label={`${value[0]?.toUpperCase()}${value.slice(1)} theme`}
          {...stylex.props(
            notebook.themeButton,
            mounted && theme === value && notebook.themeActive,
          )}
        >
          <Icon width={14} height={14} aria-hidden="true" />
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

export function DocumentationFooter({ items }: FooterProps): ReactNode {
  const pages = useFooterItems();
  const path = useTreePath();
  const current = path.at(-1);
  const position = pages.findIndex(
    (page) => page.url === (current?.type === "page" ? current.url : undefined),
  );
  const previous = items?.previous ?? (position >= 0 ? pages[position - 1] : undefined);
  const next = items?.next ?? (position >= 0 ? pages[position + 1] : undefined);
  const labels = useTranslations();
  if (!previous && !next) return null;
  return (
    <nav
      aria-label="Adjacent pages"
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
            {previous.description ?? labels.previousPage}
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
            {next.description ?? labels.nextPage}
          </span>
        </Link>
      )}
    </nav>
  );
}
