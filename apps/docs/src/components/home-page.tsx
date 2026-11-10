"use client";

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- These polymorphic Buttons render anchors; override Base UI's button role. */

// Copyright 2025 NextUI Inc.
// Modified: Apple-inspired hierarchy, live glass example and Lenso documentation paths.
import NextLink from "fumadocs-core/link";
import * as stylex from "@stylexjs/stylex";
import { Button, GlassButton, Link } from "@lenso/ui";
import { HomeShell } from "./home-layout";
import { HomeShowcase } from "./home-showcase";
import { home as s } from "@/styles/home.stylex";
import { product } from "@/lib/product";
import type { Locale } from "@/lib/source";

const foundations = [
  {
    path: "components/glass-button",
    en: "Materials with a purpose.",
    cn: "材质，各司其职。",
    description: "Glass for floating controls. Quiet surfaces for the content that matters.",
    descriptionCn: "玻璃承载浮动控件，安静的表面承载内容。让层级清晰，也让注意力有所归属。",
    link: "Meet GlassButton",
    linkCn: "查看 GlassButton",
  },
  {
    path: "getting-started/architecture",
    en: "Familiar from the first touch.",
    cn: "上手，就很熟悉。",
    description:
      "Native Web interaction, composed with Base UI. Keyboard, focus and editing stay familiar.",
    descriptionCn: "基于 Base UI 组合原生 Web 交互，让键盘、焦点与文本编辑遵循熟悉的方式。",
    link: "Read the composition guide",
    linkCn: "阅读组合指南",
  },
  {
    path: "getting-started/theming",
    en: "Make it feel like yours.",
    cn: "一致，也有你的个性。",
    description:
      "Semantic colors, light and dark appearances, and StyleX. A shared language with room for your product.",
    descriptionCn:
      "语义颜色、浅色与深色外观，以及 StyleX。在统一的设计语言中，保留产品自己的表达。",
    link: "Shape your theme",
    linkCn: "了解主题定制",
  },
] as const;

export function HomePage({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  return (
    <HomeShell locale={locale}>
      <main id="main-content" {...stylex.props(s.main)}>
        <section aria-labelledby="home-title" {...stylex.props(s.hero)}>
          <HomeShowcase locale={locale}>
            <div {...stylex.props(s.heroContent)}>
              <div {...stylex.props(s.heroHeading)}>
                <p {...stylex.props(s.eyebrow, s.heroEyebrow)}>React. StyleX. Liquid Glass.</p>
                <h1 id="home-title" {...stylex.props(s.title)}>
                  {cn ? "熟悉的感觉。" : "Feels familiar."}
                  <br />
                  <span {...stylex.props(s.titleMuted)}>
                    {cn ? "全新的可能。" : "A fresh perspective."}
                  </span>
                </h1>
              </div>
              <div {...stylex.props(s.heroIntroduction)}>
                <p {...stylex.props(s.description)}>
                  {cn
                    ? "遵循 Apple 设计理念的 React 组件库。"
                    : "React components with an Apple-inspired point of view."}
                </p>
                <div {...stylex.props(s.ctas)}>
                  <Button
                    nativeButton={false}
                    role="link"
                    size="lg"
                    variant="prominent"
                    xstyle={s.heroAction}
                    render={<NextLink href={`/${locale}/docs/react/getting-started`} />}
                  >
                    {cn ? "阅读文档" : "Read the docs"}
                  </Button>
                  <GlassButton
                    xstyle={s.heroAction}
                    nativeButton={false}
                    role="link"
                    size="lg"
                    render={<NextLink href={`/${locale}/docs/react/components`} />}
                  >
                    {cn ? "浏览组件" : "Components"}
                  </GlassButton>
                </div>
              </div>
            </div>
          </HomeShowcase>
        </section>
        <section aria-labelledby="foundations-title" {...stylex.props(s.foundations)}>
          <div {...stylex.props(s.sectionHeading)}>
            <p {...stylex.props(s.eyebrow)}>{cn ? "Lenso 的设计语言" : "The Lenso approach"}</p>
            <h2 id="foundations-title" {...stylex.props(s.sectionTitle)}>
              {cn ? "细节，汇成整体。" : "Small details. One considered whole."}
            </h2>
          </div>
          <div {...stylex.props(s.rows)}>
            {foundations.map((item) => (
              <div key={item.path} {...stylex.props(s.row)}>
                <h3 {...stylex.props(s.rowTitle)}>{item[locale]}</h3>
                <div {...stylex.props(s.rowContent)}>
                  <p {...stylex.props(s.rowDescription)}>
                    {cn ? item.descriptionCn : item.description}
                  </p>
                  <Link
                    render={<NextLink href={`/${locale}/docs/react/${item.path}`} />}
                    xstyle={s.textLink}
                  >
                    {cn ? item.linkCn : item.link}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer {...stylex.props(s.footer)}>
        <div {...stylex.props(s.footerLinks)}>
          <Link
            render={<NextLink href={`/${locale}/docs/react/getting-started`} />}
            xstyle={s.footerLink}
          >
            {cn ? "文档" : "Documentation"}
          </Link>
          <Link href={product.repository} xstyle={s.footerLink}>
            GitHub
          </Link>
        </div>
      </footer>
    </HomeShell>
  );
}
