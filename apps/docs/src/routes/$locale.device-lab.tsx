import { createFileRoute } from "@tanstack/react-router";
import { DeviceLab } from "../components/device-lab";
export const Route = createFileRoute("/$locale/device-lab")({
  validateSearch: (search) => ({ app: search["app"] === "music" ? ("music" as const) : undefined }),
  head: () => ({ meta: [{ title: "Device frame · Lenso UI" }] }),
  component: () => {
    const { locale } = Route.useParams();
    const { app = "photos" } = Route.useSearch();
    return <DeviceLab key={`${locale}/${app}`} locale={locale === "cn" ? "cn" : "en"} app={app} />;
  },
});
