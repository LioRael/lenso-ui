import { prepareInteraction } from "./interaction.ts";
import { prepareReading } from "./reading.ts";
import type { pageSeo } from "../seo.ts";

prepareInteraction();
const reading = prepareReading();

type Metadata = ReturnType<typeof pageSeo>;
const root = document.getElementById("exact-root");
let previous: Element | null | undefined;
function sync() {
  const context = root?.querySelector("[data-docs-seo]") ?? null;
  if (context === previous) return;
  previous = context;
  const raw = context?.getAttribute("data-docs-seo");
  const meta: Metadata = raw
    ? JSON.parse(raw)
    : { lang: "en", dir: "ltr", alternates: [], canonical: "", robots: "noindex,follow" };
  document.documentElement.lang = meta.lang;
  document.documentElement.dir = meta.dir;
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (meta.canonical) {
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = meta.canonical;
  } else canonical?.remove();
  let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement("meta");
    robots.name = "robots";
    document.head.append(robots);
  }
  robots.content = meta.robots;
  for (const link of document.head.querySelectorAll("[data-docs-alternate]")) link.remove();
  for (const item of meta.alternates) {
    const link = document.createElement("link");
    link.rel = "alternate";
    link.hreflang = item.lang;
    link.href = item.href;
    link.setAttribute("data-docs-alternate", "");
    document.head.append(link);
  }
  reading.sync(context);
}
if (root) {
  sync();
  new MutationObserver(sync).observe(root, { childList: true, subtree: true });
}
