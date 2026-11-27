import { renderToString } from "vue/server-renderer";
import { createSSRApp } from "vue";
import App from "./App.vue";

export async function renderPage(template: string) {
  const html = await renderToString(createSSRApp(App));
  return template.replace("<!--app-->", () => html);
}
