import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { DocumentationSiteLayout } from "@lenso/docs/client";
import { SearchDialog } from "../components/fumadocs/ui/search-dialog";
import { createLensoSiteOptions } from "../components/docs-site-options";
import { getNavigation, getSectionEntries, isLocale } from "../lib/source";
import { product } from "../lib/product";
export const Route = createFileRoute("/$locale/docs")({ component: DocsShell });
function DocsShell() {
  const { locale } = Route.useParams();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (!isLocale(locale)) throw new Error("Unsupported locale");
  const slug = pathname.slice(`/${locale}/docs/`.length);
  const section = slug.startsWith("react/tools")
    ? "getting-started"
    : (slug.split("/")[1] ?? "getting-started");
  const options = createLensoSiteOptions({
    locale,
    slug,
    repository: product.repository,
    entries: getNavigation(locale, section),
    sectionEntries: getSectionEntries(locale),
  });
  return (
    <SearchDialog locale={locale}>
      <DocumentationSiteLayout {...options}>
        <Outlet />
      </DocumentationSiteLayout>
    </SearchDialog>
  );
}
