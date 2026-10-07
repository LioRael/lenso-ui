import type { DocumentationCustomizationContext } from "@lenso/docs/react";
import Note from "./components/Note";

export function getComponents({ page }: DocumentationCustomizationContext) {
  return {
    Note,
    PageKind: () => <span>{page.kind}</span>,
    PageAudience: () => <span>{String(page.metadata?.audience ?? "All readers")}</span>,
  };
}

export function getSiteSlots() {
  return { identity: <span aria-label="Documentation edition">Starter</span> };
}
