"use client";

// HeroUI v3.2.6 homepage, Apache-2.0, Copyright 2025 NextUI Inc.
// Modified copy, destinations and component composition for Lenso UI.
import NextLink from "next/link";
import * as stylex from "@stylexjs/stylex";
import { Link } from "@lenso/ui";
import { LogoGithub, Rocket } from "@gravity-ui/icons";
import { HomeShell } from "./home-layout";
import { HomeShowcase } from "./home-showcase";
import { home as s } from "@/styles/home.stylex";
import { product } from "@/lib/product";
import type { Locale } from "@/lib/source";

export function HomePage({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  return (
    <HomeShell locale={locale}>
      <main id="main-content" {...stylex.props(s.main)}>
        <section aria-labelledby="home-title" {...stylex.props(s.hero)}>
          <div {...stylex.props(s.heroContent)}>
            <Link
              render={<NextLink href={`/${locale}/docs/react/getting-started/versioning`} />}
              xstyle={s.release}
            >
              <Rocket width={12} height={12} aria-hidden="true" />
              Lenso UI {product.version} · {cn ? "源码候选版本" : "Source candidate"}
            </Link>
            <h1 id="home-title" {...stylex.props(s.title)}>
              <span>{cn ? "开箱即用的美感。" : "Beautiful by default."}</span>
              <span {...stylex.props(s.titleMuted)}>
                {cn ? "为自由定制而设计。" : "Customizable by design."}
              </span>
            </h1>
            <p {...stylex.props(s.description)}>
              {cn
                ? "Lenso UI 是 React 组件库，以原生交互和 StyleX 样式，帮助你快速构建、保持一致，并按需定制界面。"
                : "Lenso UI is a React component library built to help you move fast, stay consistent, and customize with StyleX."}
            </p>
            <div {...stylex.props(s.ctas)}>
              <Link
                render={<NextLink href={`/${locale}/docs/react/getting-started`} />}
                xstyle={[s.cta, s.primary]}
              >
                {cn ? "开始使用" : "Get started"}
              </Link>
              <Link
                render={<NextLink href={`/${locale}/docs/react/components`} />}
                xstyle={[s.cta, s.outline]}
              >
                {cn ? "查看组件" : "View components"}
              </Link>
            </div>
            <Link href={product.repository} xstyle={s.repository}>
              <LogoGithub width={14} height={14} aria-hidden="true" />
              {cn ? "在 GitHub 查看源码" : "Open source on GitHub"}
            </Link>
          </div>
        </section>
        <HomeShowcase locale={locale} />
      </main>
      <footer {...stylex.props(s.footer)}>
        <span>Lenso UI · {product.version}</span>
        <Link
          render={<NextLink href={`/${locale}/docs/react/getting-started`} />}
          xstyle={s.footerLink}
        >
          {cn ? "文档" : "Documentation"}
        </Link>
        <Link href={product.repository} xstyle={s.footerLink}>
          GitHub
        </Link>
        <Link render={<NextLink href="/coverage" />} xstyle={s.footerLink}>
          {cn ? "验证覆盖" : "Verification coverage"}
        </Link>
      </footer>
    </HomeShell>
  );
}
