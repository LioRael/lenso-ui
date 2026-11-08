import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../components/home-page";
import { isLocale } from "../lib/source";
import { homeHead } from "../lib/route-head";
export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => homeHead(isLocale(params.locale) ? params.locale : "en"),
  component: () => {
    const { locale } = Route.useParams();
    if (!isLocale(locale)) throw new Error("Unsupported locale");
    return <HomePage locale={locale} />;
  },
});
