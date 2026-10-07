import Link from "next/link";
import * as stylex from "@stylexjs/stylex";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { notebook } from "@lenso/docs/presentation";

interface Entry {
  label: string;
  href?: string;
  description?: string;
}

export function DocsFooter({
  previous,
  next,
  locale,
}: {
  previous?: Entry | undefined;
  next?: Entry | undefined;
  locale: "en" | "cn";
}) {
  return (
    <nav
      aria-label="Adjacent pages"
      {...stylex.props(notebook.pageFooter, !(previous && next) && notebook.footerSingle)}
    >
      {previous?.href && (
        <Link href={previous.href} {...stylex.props(notebook.footerLink)}>
          <span {...stylex.props(notebook.footerTitle)}>
            <ChevronLeft
              width={16}
              height={16}
              aria-hidden="true"
              {...stylex.props(notebook.footerIcon)}
            />
            {previous.label}
          </span>
          <span {...stylex.props(notebook.footerDescription)}>
            {previous.description ?? (locale === "cn" ? "上一页" : "Previous page")}
          </span>
        </Link>
      )}
      {next?.href && (
        <Link href={next.href} {...stylex.props(notebook.footerLink, notebook.footerNext)}>
          <span {...stylex.props(notebook.footerTitle, notebook.footerTitleNext)}>
            <ChevronRight
              width={16}
              height={16}
              aria-hidden="true"
              {...stylex.props(notebook.footerIcon)}
            />
            {next.label}
          </span>
          <span {...stylex.props(notebook.footerDescription)}>
            {next.description ?? (locale === "cn" ? "下一页" : "Next page")}
          </span>
        </Link>
      )}
    </nav>
  );
}
