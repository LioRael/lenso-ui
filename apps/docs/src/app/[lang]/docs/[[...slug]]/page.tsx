import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import * as stylex from "@stylexjs/stylex";
import { ChevronLeft, ChevronRight } from "@gravity-ui/icons";
import { DocsLayout } from "@/components/fumadocs/layouts/notebook";
import { PageTableOfContents } from "@/components/fumadocs/layouts/notebook/page";
import { ComponentLinks } from "@/components/component-links";
import { ViewOptions } from "@/components/ai/page-actions";
import {
  source,
  isLocale,
  getPage,
  getNavigation,
  readPage,
  pageUrl,
  canonicalSlug,
  getSectionEntries,
} from "@/lib/source";
import { getMDXComponents, headingId } from "@/mdx-components";
import { styles } from "@/styles/docs.stylex";
import { notebook } from "@/styles/notebook.stylex";
import { NativeApiReference } from "@/components/native-api-reference";
import { product } from "@/lib/product";
import reference from "@/generated/api-reference.json";
import { headingText, nativeApiFamily, replaceNativeApiSection } from "@/lib/native-api-section";

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
  if (canonicalSlug(slug.join("/")) !== slug.join("/"))
    redirect(`/${lang}/docs/${canonicalSlug(slug.join("/"))}`);
  const page = getPage(lang, slug.join("/"));
  if (!page) notFound();
  const raw = await readPage(page);
  const parsed = matter(raw);
  const contentSource = parsed.content;
  const candidate = nativeApiFamily(page.slug);
  const family = candidate && Object.hasOwn(reference.families, candidate) ? candidate : undefined;
  const headings: { title: string; id: string; depth: number }[] = [];
  const nativeSection = () => (tree: Parameters<typeof replaceNativeApiSection>[0]) => {
    if (family) {
      const locale = lang === "cn" ? "zh" : "en";
      replaceNativeApiSection(tree, family, locale);
    }
    for (const node of tree.children ?? []) {
      if (node.type === "mdxJsxFlowElement" && node.name === "NativeApiReference") {
        headings.push({
          title: lang === "cn" ? "API 参考" : "API Reference",
          id: `native-api-${family}`,
          depth: 2,
        });
      } else if (node.type === "heading" && node.depth && node.depth >= 2 && node.depth <= 4) {
        const title = headingText(node);
        if (node.depth === 4 && !title.includes("[!toc]")) continue;
        headings.push({
          title: title.replace(/\[!toc\]/g, "").trim(),
          id: headingId(title),
          depth: node.depth,
        });
      }
    }
  };
  const { content } = await compileMDX({
    source: contentSource,
    components: { ...getMDXComponents(lang), NativeApiReference },
    options: {
      // Compile only authored local content; archive MDX never enters the public route.
      blockJS: false,
      blockDangerousJS: true,
      mdxOptions: { remarkPlugins: [remarkGfm, nativeSection] },
    },
  });
  const section = page.slug.split("/")[1] ?? "getting-started";
  const entries = await getNavigation(lang, section);
  const searchEntries = source.pages
    .filter((candidate) => candidate.locale === lang)
    .map((candidate) => ({ label: candidate.title, href: pageUrl(candidate) }));
  const pageEntries = entries.filter((entry) => entry.href);
  const position = pageEntries.findIndex((entry) => entry.href === pageUrl(page));
  const previous = pageEntries[position - 1];
  const next = pageEntries[position + 1];
  return (
    <DocsLayout
      locale={lang}
      slug={page.slug}
      entries={entries}
      searchEntries={searchEntries}
      version={product.version}
      repository={product.repository}
      sectionEntries={getSectionEntries(lang)}
    >
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
              sourceUrl={`${product.repository}/blob/main/apps/docs/${page.slug.startsWith("react/components") ? "scripts/docs-projection.mjs" : page.markdownFile}`}
            />
          </div>
          <p {...stylex.props(styles.description)}>{page.description}</p>
          <ComponentLinks family={family} />
          {content}
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
                  {previous.description ?? (lang === "cn" ? "上一页" : "Previous page")}
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
                  {next.description ?? (lang === "cn" ? "下一页" : "Next page")}
                </span>
              </Link>
            )}
          </nav>
        </article>
      </main>
    </DocsLayout>
  );
}
