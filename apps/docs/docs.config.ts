import { defineDocs } from "@lenso/docs";

export default defineDocs({
  title: "Lenso UI",
  description:
    "React components with StyleX, native Base UI interactions and React Aria date, time and color models.",
  siteUrl: process.env["LENSO_DOCS_SITE"] ?? "http://localhost:3000",
  source: "docs.source.mjs",
  components: "docs.components.tsx",
  root: "docs.root.tsx",
  build: "docs.build.mjs",
  aliases: { "@": "src" },
  styles: ["src/styles/global.css"],
  stylesheet: "consumer",
  trailingSlash: false,
  defaultLocale: "en",
  locales: [
    { code: "en", label: "English", language: "en", routePrefix: "/en/docs" },
    { code: "cn", label: "中文", language: "zh-CN", routePrefix: "/cn/docs" },
  ],
});
