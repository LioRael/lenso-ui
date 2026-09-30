import type { ReactNode } from "react";
import DocumentLayout from "@/components/document-layout";
import { DocsLayout } from "@/components/fumadocs/layouts/notebook";
import { getNavigation, pageUrl, source } from "@/lib/source";

export { metadata } from "@/components/document-layout";

export default async function UtilityLayout({ children }: { children: ReactNode }) {
  const entries = await getNavigation("en", "getting-started");
  const searchEntries = source.pages
    .filter((page) => page.locale === "en")
    .map((page) => ({ label: page.title, href: pageUrl(page) }));
  return (
    <DocumentLayout>
      <DocsLayout
        locale="en"
        slug="react/getting-started"
        entries={entries}
        searchEntries={searchEntries}
      >
        {children}
      </DocsLayout>
    </DocumentLayout>
  );
}
