import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";
import fumaMDX from "fumadocs-ui/mdx";
import * as stylex from "@stylexjs/stylex";
import { HandPointUp } from "@gravity-ui/icons";
import { ComponentsCategory } from "@/components/components-category";
import {
  ColorSectionSideBySide,
  ColorSectionStacked,
  ColorSectionFormField,
  ColorSectionPrimitive,
} from "@/components/color-section";
import { source, pageUrl, type Locale } from "@/lib/source";
import { styles } from "@/styles/docs.stylex";
import { prose } from "@/styles/prose.stylex";
import { getRelatedComponents } from "@/components-registry";
import { Tab, Tabs } from "@/mdx-components/tabs";
import { MDXCodeBlock } from "@/mdx-components/code";
import { headingId } from "@/lib/heading-id.mjs";
export { headingId } from "@/lib/heading-id.mjs";

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
        : /^\/(?:themes|showcase|blog|native|skills|install|contact)/.test(href)
          ? `https://www.heroui.com${href}`
          : href;
  return (
    <a {...rest} href={local} {...stylex.props(prose.link)}>
      {children}
    </a>
  );
}

function PageCards({ pages }: { pages: { title: string; description: string; href: string }[] }) {
  return (
    <div {...stylex.props(styles.grid)}>
      {pages.map((page) => (
        <a key={page.href} href={page.href} {...stylex.props(styles.link, styles.callout)}>
          <strong>{page.title}</strong>
          <p {...stylex.props(styles.muted)}>{page.description}</p>
        </a>
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
    h1: ({ children, id }) => (
      <fumaMDX.h2
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h2)}
      >
        {children}
      </fumaMDX.h2>
    ),
    h2: ({ children, id }) => (
      <fumaMDX.h2
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h2)}
      >
        {children}
      </fumaMDX.h2>
    ),
    h3: ({ children, id }) => (
      <fumaMDX.h3
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h3)}
      >
        {children}
      </fumaMDX.h3>
    ),
    h4: ({ children, id }) => (
      <fumaMDX.h4
        id={id ?? headingId(plainText(children))}
        aria-label={plainText(children)}
        {...stylex.props(styles.h3)}
      >
        {children}
      </fumaMDX.h4>
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
    ComponentsCategory: ({ category }: { category: string }) => {
      const pages = componentPages.filter((page) => page.componentCategory === category);
      return <ComponentsCategory pages={pages} />;
    },
    RelatedComponents: ({ component }: { component: string }) => {
      const related = getRelatedComponents(component, locale).slice(0, 3);
      return (
        <PageCards
          pages={related.map((candidate) => ({ ...candidate, href: pageUrl(candidate) }))}
        />
      );
    },
    RelatedShowcases: ({ component }: { component: string }) => (
      <p {...stylex.props(styles.muted)}>
        See{" "}
        <a
          href={`https://www.heroui.com/showcase?component=${encodeURIComponent(component)}`}
          {...stylex.props(styles.proseLink)}
        >
          upstream {component} showcases
        </a>
        . Product showcases are not part of the local component runtime.
      </p>
    ),
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
    PRContributors: () => (
      <a
        href="https://github.com/heroui-inc/heroui/graphs/contributors"
        {...stylex.props(styles.proseLink)}
      >
        HeroUI contributors
      </a>
    ),
    HandPointUp,
    CollapsibleCode: ({ children }: { children?: ReactNode }) => (
      <details>
        <summary {...stylex.props(styles.sourceSummary)}>View code</summary>
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
          <summary {...stylex.props(styles.sourceSummary)}>Read the historical prompt</summary>
          <pre {...stylex.props(styles.pre)}>
            <code>{prompt}</code>
          </pre>
        </details>
      </Frame>
    ),
    ColorSectionSideBySide,
    ColorSectionStacked,
    ColorSectionFormField,
    ColorSectionPrimitive,
    ...overrides,
  };
}
