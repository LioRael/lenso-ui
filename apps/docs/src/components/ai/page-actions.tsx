"use client";
import { DocumentationPageActions } from "@lenso/docs/client";
export function ViewOptions(props: {
  loadMarkdown: () => Promise<string>;
  sourceUrl: string;
  locale?: string;
}) {
  return <DocumentationPageActions {...props} />;
}
