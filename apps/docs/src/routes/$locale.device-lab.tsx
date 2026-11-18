import { createFileRoute } from "@tanstack/react-router";
import { DeviceLab } from "../components/device-lab";
export const Route = createFileRoute("/$locale/device-lab")({
  head: () => ({ meta: [{ title: "Device frame · Lenso UI" }] }),
  component: () => {
    const { locale } = Route.useParams();
    return <DeviceLab key={locale} locale={locale === "cn" ? "cn" : "en"} />;
  },
});
