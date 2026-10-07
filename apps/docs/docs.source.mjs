import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function prepare({ root }) {
  const child = spawn("pnpm", ["exec", "tsx", "scripts/generate-docs.ts"], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
  const interrupt = () => child.kill("SIGINT");
  const terminate = () => child.kill("SIGTERM");
  process.once("SIGINT", interrupt);
  process.once("SIGTERM", terminate);
  try {
    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("exit", (code, signal) =>
        code === 0
          ? resolve()
          : reject(new Error(`Documentation generation failed (${signal ?? code}).`)),
      );
    });
  } finally {
    process.removeListener("SIGINT", interrupt);
    process.removeListener("SIGTERM", terminate);
  }
}

function homeMetadata(locale) {
  const cn = locale === "cn";
  const title = cn ? "Lenso UI · React 组件与 StyleX" : "Lenso UI — React components with StyleX";
  const description = cn
    ? "探索 Lenso UI 的 React 组件、原生交互、StyleX 样式和主题配置。"
    : "Explore Lenso UI React components, native interactions, StyleX styling and customizable themes.";
  const canonical = cn ? "/cn" : "/";
  return {
    title: { absolute: title },
    description,
    alternates: { canonical, languages: { en: "/", "zh-CN": "/cn", "x-default": "/" } },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      locale: cn ? "zh_CN" : "en_US",
    },
    twitter: { card: "summary", title, description },
  };
}

export async function loadSource({ root }) {
  // Read generation output fresh: Node's JSON module cache must not pin a dev index.
  const index = JSON.parse(
    await readFile(path.join(root, "src/generated/lenso-docs-index.json"), "utf8"),
  );
  const pages = await Promise.all(
    index.pages.map(async (page) => ({
      id: `${page.locale}/${page.slug}`,
      module: `src/generated/documents/${page.locale}/${page.slug}.tsx`,
      slug: page.slug,
      url: `/${page.locale}/docs/${page.slug}`,
      locale: page.locale,
      title: page.title,
      description: page.description,
      kind: page.slug.startsWith("react/components/") ? "component" : "docs",
      markdown: await readFile(path.join(root, page.markdownFile), "utf8"),
      metadata: {
        markdownFile: page.markdownFile,
        section: page.slug.split("/")[1] ?? "getting-started",
      },
      collection: /^react\/(?:getting-started|tools)(?:\/|$)/.test(page.slug)
        ? "getting-started"
        : (page.slug.split("/")[1] ?? "getting-started"),
      navigation: {
        order: page.navigationOrder ?? 0,
        ...(page.navigationGroup ? { group: page.navigationGroup } : {}),
      },
    })),
  );
  const routes = [
    {
      path: "/",
      locale: "en",
      module: "routes/home.tsx",
      props: { locale: "en" },
      metadata: homeMetadata("en"),
    },
    ...["en", "cn"].map((locale) => ({
      path: `/${locale}`,
      locale,
      module: "routes/home.tsx",
      props: { locale },
      metadata: homeMetadata(locale),
    })),
    ...["en", "cn"].map((locale) => ({
      path: `/${locale}/theme-builder`,
      locale,
      module: "routes/theme-builder.tsx",
      props: { locale },
      metadata: {
        title: locale === "cn" ? "主题配置中心" : "Theme builder",
        description:
          locale === "cn"
            ? "配置 Lenso UI 明暗主题，实时预览组件并导出主题。"
            : "Configure Lenso UI light and dark themes, preview live components and export your theme.",
        alternates: {
          canonical: `/${locale}/theme-builder`,
          languages: { en: "/en/theme-builder", "zh-CN": "/cn/theme-builder" },
        },
      },
    })),
    {
      path: "/coverage",
      locale: "en",
      module: "routes/coverage.tsx",
      metadata: { title: "Documentation coverage" },
    },
  ];
  const redirects = [
    { from: "/docs", to: "/en/docs/react/getting-started" },
    ...["en", "cn"].map((locale) => ({
      from: `/${locale}/docs`,
      to: `/${locale}/docs/react/getting-started`,
    })),
    ...index.pages
      .filter((page) => page.locale === "en")
      .map((page) => ({
        from: `/docs/${page.slug}`,
        to: `/en/docs/${page.slug}`,
      })),
  ];
  for (const [alias, canonical] of Object.entries(index.sourceFamilyMapping)) {
    if (alias === canonical) continue;
    redirects.push({
      from: `/docs/react/components/${alias}`,
      to: `/en/docs/react/components/${canonical}`,
    });
    for (const locale of ["en", "cn"]) {
      redirects.push({
        from: `/${locale}/docs/react/components/${alias}`,
        to: `/${locale}/docs/react/components/${canonical}`,
      });
    }
  }
  return {
    render: "custom",
    pages,
    routes,
    redirects,
    search: { en: "public/search/en.json", cn: "public/search/cn.json" },
    watchPaths: ["content/lenso", "src/generated", "src/demos"],
  };
}
