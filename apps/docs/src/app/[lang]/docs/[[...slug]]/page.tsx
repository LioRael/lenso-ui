import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import * as stylex from "@stylexjs/stylex";
import { DocsLayout } from "@/components/fumadocs/layouts/notebook";
import { PageTableOfContents } from "@/components/fumadocs/layouts/notebook/page";
import { ComponentLinks } from "@/components/component-links";
import { ViewOptions } from "@/components/ai/page-actions";
import { source, isLocale, getPage, getNavigation, readPage, pageUrl } from "@/lib/source";
import { getMDXComponents, headingId } from "@/mdx-components";
import { styles } from "@/styles/docs.stylex";
import { notebook } from "@/styles/notebook.stylex";
import { LocalInstallation } from "@/components/local-installation";

interface Props {
  params: Promise<{ lang: string; slug?: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    { lang: "en", slug: [] },
    { lang: "cn", slug: [] },
    ...source.pages.map((page) => ({ lang: page.locale, slug: page.slug.split("/") })),
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const page = getPage(lang, slug?.join("/") ?? "react/getting-started");
  if (!page) return { title: "Documentation" };
  const languages = Object.fromEntries(
    source.pages
      .filter((candidate) => candidate.slug === page.slug)
      .map((candidate) => [candidate.locale === "cn" ? "zh-CN" : "en", pageUrl(candidate)]),
  );
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: pageUrl(page), languages },
    openGraph: {
      title: `${page.title} · Lenso UI`,
      description: page.description,
      url: pageUrl(page),
      siteName: "Lenso UI",
      locale: lang === "cn" ? "zh_CN" : "en_US",
      type: "article",
    },
  };
}

export default async function DocsPage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  if (!slug?.length) redirect(`/${lang}/docs/react/getting-started`);
  const page = getPage(lang, slug.join("/"));
  if (!page) notFound();
  const raw = await readPage(page);
  const parsed = matter(raw);
  const contentSource = parsed.content;
  const { content } = await compileMDX({
    source: contentSource,
    components: getMDXComponents(lang),
    options: {
      // v6 otherwise drops literal JSX arrays/objects (color sections, tabs, prompts).
      // Only the integrity-checked pinned local MDX enters this compiler.
      blockJS: false,
      blockDangerousJS: true,
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
  });
  const section = page.slug.split("/")[1] ?? "getting-started";
  const entries = await getNavigation(lang, section);
  const headings = [
    ...contentSource.replace(/(`{3,})[\s\S]*?\1/g, "").matchAll(/^(#{2,4}) (.+)$/gm),
  ]
    .filter(([, hashes, title]) => hashes !== "####" || title?.includes("[!toc]"))
    .map(([, hashes, title]) => ({
      title: (title ?? "")
        .replace(/\[!toc\]/g, "")
        .replace(/[`*]/g, "")
        .trim(),
      id: headingId(title ?? ""),
      depth: hashes?.length ?? 2,
    }));
  const searchEntries = source.pages
    .filter((candidate) => candidate.locale === lang)
    .map((candidate) => ({ label: candidate.title, href: pageUrl(candidate) }));
  const pageEntries = entries.filter((entry) => entry.href);
  const position = pageEntries.findIndex((entry) => entry.href === pageUrl(page));
  const previous = pageEntries[position - 1];
  const next = pageEntries[position + 1];
  return (
    <DocsLayout locale={lang} slug={page.slug} entries={entries} searchEntries={searchEntries}>
      <PageTableOfContents items={headings} locale={lang} />
      <main
        id="main-content"
        tabIndex={-1}
        lang={lang === "cn" ? "zh-CN" : "en"}
        {...stylex.props(styles.content)}
      >
        <article id="nd-page" {...stylex.props(styles.article)}>
          <div {...stylex.props(notebook.headingRow)}>
            <h1 {...stylex.props(styles.title)}>{page.title}</h1>
            <ViewOptions
              markdown={raw}
              sourceUrl={`https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/apps/docs/${page.file}`}
            />
          </div>
          <p {...stylex.props(styles.description)}>{page.description}</p>
          <ComponentLinks links={parsed.data["links"]} />
          {(page.slug === "react/getting-started" ||
            page.slug === "react/getting-started/quick-start") && <LocalInstallation />}
          {content}
          <nav aria-label="Adjacent pages" {...stylex.props(notebook.pageFooter)}>
            {previous?.href && (
              <Link href={previous.href} {...stylex.props(notebook.footerLink)}>
                <strong>← {previous.label}</strong>
                <span {...stylex.props(styles.muted)}>
                  {lang === "cn" ? "上一页" : "Previous page"}
                </span>
              </Link>
            )}
            {next?.href && (
              <Link href={next.href} {...stylex.props(notebook.footerLink, notebook.footerNext)}>
                <strong>{next.label} →</strong>
                <span {...stylex.props(styles.muted)}>
                  {lang === "cn" ? "下一页" : "Next page"}
                </span>
              </Link>
            )}
          </nav>
          <footer {...stylex.props(styles.footer)}>
            Documentation derived from{" "}
            <a
              href={`https://github.com/heroui-inc/heroui/blob/e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e/apps/docs/${page.file}`}
              {...stylex.props(styles.proseLink)}
            >
              HeroUI v3.2.6
            </a>
            , licensed under Apache-2.0. Imports and runtime changed for Lenso UI.
            <p>
              Lenso UI is an independent derivation, not an official HeroUI product. Ordinary
              controls use native Base UI; date, time, and color use local React Aria projections.
              Imported API tables and Tailwind instructions are upstream historical reference, not
              the local API.{" "}
              <Link href="/coverage" {...stylex.props(styles.proseLink)}>
                Check migration coverage
              </Link>
              .
            </p>
          </footer>
        </article>
      </main>
    </DocsLayout>
  );
}
