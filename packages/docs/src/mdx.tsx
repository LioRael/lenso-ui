import type { MDXComponents } from "mdx/types";
import { isValidElement, type ComponentProps, type ReactNode } from "react";
import fumaMDX from "fumadocs-ui/mdx";
import { Tab, Tabs } from "@lenso/docs/tabs";
import { Step, Steps } from "fumadocs-ui/components/steps";
import * as stylex from "@stylexjs/stylex";
import { ChevronDown } from "@gravity-ui/icons";
import { styles, prose } from "@lenso/docs/presentation";
import { DocumentationCodeBlock } from "./code-block";
import { ComponentExample, ReferenceTable, ApiOperation, ApiResponses } from "./reference";

function Frame({ children }: { children?: ReactNode }) {
  return <div {...stylex.props(styles.callout)}>{children}</div>;
}

function text(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(text).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return text(node.props.children);
  return "";
}

function DocumentationPre({ children }: ComponentProps<"pre">): ReactNode {
  const content = isValidElement<{ children?: ReactNode }>(children)
    ? children.props.children
    : children;
  return <DocumentationCodeBlock code={text(children)}>{content}</DocumentationCodeBlock>;
}

export function getDocumentationComponents(
  basePath: string,
  overrides: MDXComponents = {},
): MDXComponents {
  const localImage = (src: string | undefined) => {
    if (!src?.startsWith("/") || src.startsWith("//")) return src;
    if (src === basePath || src.startsWith(`${basePath}/`)) return src;
    return `${basePath.replace(/\/$/, "")}/${src.replace(/^\/+/, "")}`;
  };
  return {
    ...fumaMDX,
    Tabs,
    Tab,
    Steps,
    Step,
    ComponentExample,
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
    ReferenceTable,
    ApiOperation,
    ApiResponses,
    h2: ({ children, ...props }) => (
      <fumaMDX.h2 {...props} {...stylex.props(styles.h2)}>
        {children}
      </fumaMDX.h2>
    ),
    h3: ({ children, ...props }) => (
      <fumaMDX.h3 {...props} {...stylex.props(styles.h3)}>
        {children}
      </fumaMDX.h3>
    ),
    h4: ({ children, ...props }) => (
      <fumaMDX.h4 {...props} {...stylex.props(styles.h3)}>
        {children}
      </fumaMDX.h4>
    ),
    p: ({ children, ...props }) => (
      <p {...props} {...stylex.props(styles.paragraph)}>
        {children}
      </p>
    ),
    a: ({ children, ...props }: ComponentProps<"a">) => (
      <fumaMDX.a {...props} {...stylex.props(prose.link)}>
        {children}
      </fumaMDX.a>
    ),
    code: ({ children, className, ...props }) => (
      <code
        {...props}
        className={className}
        {...stylex.props(
          !className && !("data-language" in props) && !("data-theme" in props) && prose.code,
        )}
      >
        {children}
      </code>
    ),
    pre: DocumentationPre,
    table: ({ children, ...props }) => (
      // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- A focusable scroll region enables table scrolling in Safari.
      <section tabIndex={0} aria-label="Documentation table" {...stylex.props(prose.scroll)}>
        <table {...props} {...stylex.props(prose.table)}>
          {children}
        </table>
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
    Card: ({ children, href, title }: { children?: ReactNode; href?: string; title?: string }) =>
      href ? (
        <fumaMDX.a href={href} {...stylex.props(prose.link)}>
          {title}
          {children}
        </fumaMDX.a>
      ) : (
        <Frame>
          <strong>{title}</strong>
          {children}
        </Frame>
      ),
    Cards: ({ children }: { children?: ReactNode }) => (
      <div {...stylex.props(styles.grid)}>{children}</div>
    ),
    img: ({ src, sizes, alt, ...props }) => (
      <fumaMDX.img
        {...props}
        {...(sizes ? { sizes } : {})}
        {...(typeof src === "string" ? { src: localImage(src) } : {})}
        alt={alt}
        {...stylex.props(styles.image)}
      />
    ),
    ...overrides,
  };
}
