import type { ReactNode } from "react";
import DocumentLayout from "@/components/document-layout";
import { DocsLayout } from "@/components/fumadocs/layouts/notebook";
import { getNavigation, getSectionEntries } from "@/lib/source";
import { product } from "@/lib/product";

export { metadata } from "@/components/document-layout";

export default async function UtilityLayout({ children }: { children: ReactNode }) {
  const entries = await getNavigation("en", "getting-started");
  return (
    <DocumentLayout>
      <DocsLayout
        locale="en"
        slug="react/getting-started"
        entries={entries}
        version={product.version}
        repository={product.repository}
        sectionEntries={getSectionEntries("en")}
      >
        {children}
      </DocsLayout>
    </DocumentLayout>
  );
}
