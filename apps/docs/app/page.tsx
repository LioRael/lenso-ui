import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DocumentFrame } from "../components/docs/document-frame";
import { getDocsDocument } from "../contents/content-registry";

export const metadata: Metadata = { title: "Overview · Lenso UI" };

export default function HomePage() {
  const document = getDocsDocument("start", "overview");

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
