type Locale = "en" | "cn";
export function routeHead(
  title: string,
  description: string,
  locale: Locale,
  pathname: string,
  alternates: { en: string; cn: string },
) {
  const absolute = (path: string) => new URL(path, import.meta.env["LENSO_DOCS_SITE"]).href;
  const image = absolute("/og/lenso-ui.png");
  const imageAlt = "Lenso UI — Glass materials, menus, tabs and other real React components";
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: absolute(pathname) },
      { property: "og:locale", content: locale === "cn" ? "zh_CN" : "en_US" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Lenso UI" },
      { property: "og:image", content: image },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: imageAlt },
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
    cn
      ? "Lenso UI · 把 iOS 与 iPadOS 的设计语言带到 Web"
      : "Lenso UI · iOS and iPadOS design language on the web",
    cn
      ? "把 iOS 与 iPadOS 的设计语言和交互带到 Web。探索 Glass 材质、弹性反馈与流畅菜单，基于 Base UI 和 StyleX 构建的 React 组件。"
      : "Bringing the design language and interactions of iOS and iPadOS to the web. React components with Glass materials, elastic feedback and fluid menus, built with Base UI and StyleX.",
    locale,
    cn ? "/cn" : "/",
    { en: "/", cn: "/cn" },
  );
}
