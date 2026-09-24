import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DocumentFrame } from "../../../components/docs/document-frame";
import { getDocsDocument, getDocsRouteParams } from "../../../contents/content-registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocsRouteParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}): Promise<Metadata> {
  const { section, slug } = await params;
  const document = getDocsDocument(section, slug);
  if (!document) return {};
  return { title: `${document.title} · Lenso UI`, description: document.description };
}

export default async function DocumentationPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const document = getDocsDocument(section, slug);

  if (!document) notFound();

  const Content = document.mdxContent;

  return (
    <DocumentFrame
      description={document.description}
      eyebrow={document.eyebrow}
      layout={document.layout}
      metadata={document.metadata}
      section={document.section}
      slug={document.slug}
      title={document.title}
    >
      <Content />
    </DocumentFrame>
  );
}
