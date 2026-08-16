import { notFound } from "next/navigation";

import { DocumentFrame } from "../../../components/docs/document-frame";
import { getDocsDocument, getDocsRouteParams } from "../../../contents/content-registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return getDocsRouteParams();
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
      actions={document.actions}
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
