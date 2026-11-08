import Link from "fumadocs-core/link";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";
import fumaMDX from "fumadocs-ui/mdx";
import * as stylex from "@stylexjs/stylex";
import { ChevronDown, HandPointUp } from "@gravity-ui/icons";
import { source, pageUrl, type Locale } from "@/lib/source";
import { styles, prose } from "@lenso/docs/presentation";
import { getRelatedComponents } from "@/components-registry";
import { Tab, Tabs } from "@/mdx-components/tabs";
import { MDXCodeBlock } from "@/mdx-components/code";
import { headingId } from "@/lib/heading-id.ts";
export { headingId } from "@/lib/heading-id.ts";

function plainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(plainText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = node.props as { children?: ReactNode; alt?: string };
    return props.alt ?? plainText(props.children);
  }
  return "";
}

function Frame({ children }: { children?: ReactNode }) {
  return <div {...stylex.props(styles.callout)}>{children}</div>;
}

function DocLink({ href = "", children, ...props }: ComponentProps<"a"> & { locale: Locale }) {
  const { locale, className: _className, ...rest } = props;
  const local = href.startsWith("/docs/react")
    ? `/${locale}${href}`
    : href.startsWith("/docs/components")
      ? `/${locale}/docs/react/components${href.slice("/docs/components".length)}`
      : href.startsWith("/docs/getting-started")
        ? `/${locale}/docs/react/getting-started${href.slice("/docs/getting-started".length)}`
        : href;
  return (
    <Link {...rest} href={local} {...stylex.props(prose.link)}>
      {children}
    </Link>
  );
}

function PageCards({ pages }: { pages: { title: string; description: string; href: string }[] }) {
  return (
    <div {...stylex.props(styles.grid)}>
      {pages.map((page) => (
        <Link key={page.href} href={page.href} {...stylex.props(styles.link, styles.callout)}>
          <strong>{page.title}</strong>
          <p {...stylex.props(styles.muted)}>{page.description}</p>
        </Link>
      ))}
    </div>
  );
}

export function getMDXComponents(locale: Locale, overrides: MDXComponents = {}): MDXComponents {
  const componentPages = source.pages.filter(
    (page) => page.locale === locale && page.slug.startsWith("react/components/"),
  );
  return {
    ...fumaMDX,
    DisclosureSummary: ({ children, ...props }: ComponentProps<"summary">) => (
      <summary {...props} {...stylex.props(styles.disclosureFocus, styles.disclosureSummary)}>
        <ChevronDown
          width={16}
          height={16}
          aria-hidden="true"
          {...stylex.props(styles.disclosureChevron)}
        />
        {children}
      </summary>
    ),
    h1: ({ children, id }) => (
      <h2
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h2)}
      >
        {children}
      </h2>
    ),
    h2: ({ children, id }) => (
      <h2
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h2)}
      >
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h3)}
      >
        {children}
      </h3>
    ),
    h4: ({ children, id }) => (
      <h4
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h3)}
      >
        {children}
      </h4>
    ),
    p: ({ children }) => <p {...stylex.props(styles.paragraph)}>{children}</p>,
    a: (props) => <DocLink {...props} locale={locale} />,
    code: ({ children, className }) => (
      <code className={className} {...stylex.props(!className && prose.code)}>
        {children}
      </code>
    ),
    pre: MDXCodeBlock,
    table: ({ children, ...props }) => (
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Safari needs a focusable scroll region for keyboard table scrolling.
      <section tabIndex={0} aria-label="API reference table" {...stylex.props(prose.scroll)}>
        <fumaMDX.table {...props} {...stylex.props(prose.table)}>
          {children}
        </fumaMDX.table>
      </section>
    ),
    th: ({ children, ...props }) => (
      <th {...props} {...stylex.props(prose.cell, prose.header)}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td {...props} {...stylex.props(prose.cell)}>
        {children}
      </td>
    ),
    blockquote: Frame,
    Callout: Frame,
    Preview: Frame,
    Card: ({ children, href, title }: { children?: ReactNode; href?: string; title?: string }) =>
      href ? (
        <DocLink locale={locale} href={href}>
          {title}
          {children}
        </DocLink>
      ) : (
        <Frame>
          <strong>{title}</strong>
          {children}
        </Frame>
      ),
    Cards: ({ children }: { children?: ReactNode }) => (
      <div {...stylex.props(styles.grid)}>{children}</div>
    ),
    Tabs,
    Tab,
    ComponentCount: () => <>{componentPages.length}</>,
    ExampleCount: () => <>{Object.keys(source.examples[locale]).length}</>,
    RelatedComponents: ({ component }: { component: string }) => {
      const related = getRelatedComponents(component, locale).slice(0, 3);
      return (
        <PageCards
          pages={related.map((candidate) => ({ ...candidate, href: pageUrl(candidate) }))}
        />
      );
    },
    DocsImage: ({
      src,
      alt,
      width,
      height,
      href,
    }: {
      src: string;
      alt: string;
      width?: number;
      height?: number;
      href?: string;
    }) => {
      const image = (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          {...stylex.props(styles.image)}
        />
      );
      return href ? (
        <DocLink locale={locale} href={href}>
          {image}
        </DocLink>
      ) : (
        image
      );
    },
    VideoPlayer: ({ src, poster }: { src: string; poster?: string }) => (
      <a href={src} {...stylex.props(styles.proseLink)}>
        {poster && (
          <img
            src={poster}
            alt="Upstream demonstration recording"
            loading="lazy"
            {...stylex.props(styles.image)}
          />
        )}
        Watch the upstream demonstration recording
      </a>
    ),
    HandPointUp,
    CollapsibleCode: ({ children }: { children?: ReactNode }) => (
      <details>
        <summary {...stylex.props(styles.sourceSummary, styles.disclosureFocus)}>View code</summary>
        {children}
      </details>
    ),
    CopyPrompt: ({ children, prompt }: { children?: ReactNode; prompt: string }) => (
      <Frame>
        {children}
        <p>
          Historical upstream prompt. Its MCP and Tailwind setup does not describe the local
          runtime.
        </p>
        <details>
          <summary {...stylex.props(styles.sourceSummary, styles.disclosureFocus)}>
            Read the historical prompt
          </summary>
          <pre {...stylex.props(styles.pre)}>
            <code>{prompt}</code>
          </pre>
        </details>
      </Frame>
    ),
    ...overrides,
  };
}
