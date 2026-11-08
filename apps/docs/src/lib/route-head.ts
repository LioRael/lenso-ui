type Locale = "en" | "cn";
export function routeHead(
  title: string,
  description: string,
  locale: Locale,
  pathname: string,
  alternates: { en: string; cn: string },
) {
  const absolute = (path: string) => new URL(path, import.meta.env["LENSO_DOCS_SITE"]).href;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: absolute(pathname) },
      { property: "og:locale", content: locale === "cn" ? "zh_CN" : "en_US" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "canonical", href: absolute(pathname) },
      { rel: "alternate", hrefLang: "en", href: absolute(alternates.en) },
      { rel: "alternate", hrefLang: "zh-CN", href: absolute(alternates.cn) },
      { rel: "alternate", hrefLang: "x-default", href: absolute(alternates.en) },
    ],
  };
}
export function homeHead(locale: Locale) {
  const cn = locale === "cn";
  return routeHead(
    cn ? "Lenso UI · React 组件与 StyleX" : "Lenso UI · React components with StyleX",
    cn
      ? "探索 Lenso UI 的 React 组件、原生交互、StyleX 样式和主题配置。"
      : "Explore Lenso UI React components, native interactions, StyleX styling and customizable themes.",
    locale,
    cn ? "/cn" : "/",
    { en: "/", cn: "/cn" },
  );
}
