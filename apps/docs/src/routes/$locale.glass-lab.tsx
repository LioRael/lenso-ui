import { createFileRoute } from "@tanstack/react-router";
import { GlassLab } from "../components/glass-lab";
export const Route = createFileRoute("/$locale/glass-lab")({
  head: () => ({ meta: [{ title: "Liquid Glass · Lenso UI" }] }),
  component: () => {
    const { locale } = Route.useParams();
    return <GlassLab locale={locale === "cn" ? "cn" : "en"} />;
  },
});
