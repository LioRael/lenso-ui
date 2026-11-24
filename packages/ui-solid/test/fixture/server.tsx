import { generateHydrationScript, renderToString } from "@solidjs/web";
import { App } from "./app";

export function renderPage(template: string) {
  return template
    .replace("<!--hydration-script-->", () => generateHydrationScript())
    .replace("<!--app-->", () => renderToString(() => <App />));
}
