import { createFileRoute } from "@tanstack/react-router";
import { GlassLab } from "../components/glass-lab";
export const Route = createFileRoute("/$locale/glass-lab")({
  validateSearch: (search: Record<string, unknown>) => ({
    pipeline:
      search["pipeline"] === "scene" || search["pipeline"] === "components"
        ? search["pipeline"]
        : undefined,
  }),
  head: () => ({ meta: [{ title: "Liquid Glass · Lenso UI" }] }),
  component: GlassLabPage,
});

function GlassLabPage() {
  const { locale } = Route.useParams();
  const { pipeline } = Route.useSearch();
  return (
    <GlassLab
      locale={locale === "cn" ? "cn" : "en"}
      experimental={pipeline === "scene"}
      sceneComponents={pipeline === "components"}
    />
  );
}
