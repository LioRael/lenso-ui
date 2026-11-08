import { createFileRoute } from "@tanstack/react-router";
import { ListLibrary } from "../demos/shared/list-library";
export const Route = createFileRoute("/$locale/list-lab")({
  head: () => ({ meta: [{ title: "List library · Lenso UI" }] }),
  component: () => {
    const { locale } = Route.useParams();
    return (
      <main id="main-content" tabIndex={-1}>
        <ListLibrary locale={locale === "cn" ? "cn" : "en"} fullscreen />
      </main>
    );
  },
});
