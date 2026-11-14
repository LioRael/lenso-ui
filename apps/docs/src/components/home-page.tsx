"use client";

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- These polymorphic Buttons render anchors. */
// Copyright 2025 NextUI Inc.
// Modified: an interactive component composition and component library.
import NextLink from "fumadocs-core/link";
import * as stylex from "@stylexjs/stylex";
import { Accordion, Button, Link } from "@lenso/ui";
import { ChevronDown } from "@gravity-ui/icons";
import { HomeShell } from "./home-layout";
import { HomePlayground } from "./home-playground";
import { home as s } from "@/styles/home.stylex";
import { product } from "@/lib/product";
import type { Locale } from "@/lib/source";

const families = [
  {
    en: "Make a choice",
    cn: "每一次选择",
    items: [
      ["Select", "select"],
      ["Checkbox", "checkbox"],
      ["Calendar", "calendar"],
      ["ComboBox", "combo-box"],
    ],
  },
  {
    en: "Find your way",
    cn: "每一条路径",
    items: [
      ["Tabs", "tabs"],
      ["TabBar", "tab-bar"],
      ["Menu", "menu"],
      ["Breadcrumbs", "breadcrumbs"],
    ],
  },
  {
    en: "Get into the details",
    cn: "每一处细节",
    items: [
      ["TextField", "textfield"],
      ["DatePicker", "date-picker"],
      ["NumberField", "number-field"],
      ["InputOTP", "input-otp"],
    ],
  },
  {
    en: "Keep things in context",
    cn: "每一层表达",
    items: [
      ["Modal", "modal"],
      ["Popover", "popover"],
      ["Sheet", "sheet"],
      ["Toast", "toast"],
    ],
  },
] as const;

export function HomePage({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  return (
    <HomeShell locale={locale}>
      <main id="main-content" {...stylex.props(s.main)}>
        <section aria-labelledby="home-title" {...stylex.props(s.hero)}>
          <div {...stylex.props(s.heroIntroduction)}>
            <div>
              <p {...stylex.props(s.eyebrow)}>LENSO UI / REACT COMPONENT LIBRARY</p>
              <h1 id="home-title" {...stylex.props(s.title)}>
                {cn ? (
                  <>
                    让好想法，
                    <br />
                    <span {...stylex.props(s.titleSecond)}>用起来更好。</span>
                  </>
                ) : (
                  <>
                    Great ideas.
                    <br />
                    <span {...stylex.props(s.titleSecond)}>Beautifully usable.</span>
                  </>
                )}
              </h1>
            </div>
            <div {...stylex.props(s.heroSupporting)}>
              <p id="home-description" {...stylex.props(s.description)}>
                {cn
                  ? "从第一下点击，到每一处细节。用熟悉的交互、细腻的材质，构建让人愿意停留的界面。"
                  : "From the first click to the finishing touches. Build interfaces people love to use, with familiar interactions and considered details."}
              </p>
              <div {...stylex.props(s.ctas)}>
                <Button
                  role="link"
                  size="lg"
                  variant="prominent"
                  render={<NextLink href={`/${locale}/docs/react/getting-started`} />}
                >
                  {cn ? "开始构建" : "Start building"}
                  <span aria-hidden="true">↗</span>
                </Button>
                <Link render={<NextLink href={`/${locale}/docs/react/components`} />}>
                  {cn ? "探索组件" : "Explore components"}
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
          <HomePlayground locale={locale} />
        </section>

        <section aria-labelledby="library-title" {...stylex.props(s.library)}>
          <div {...stylex.props(s.libraryHeading)}>
            <h2 id="library-title" {...stylex.props(s.sectionTitle)}>
              {cn ? "各个部分，浑然一体。" : "All the parts. One point of view."}
            </h2>
            <Link render={<NextLink href={`/${locale}/docs/react/components`} />}>
              {cn ? "查看全部组件" : "View all components"} ↗
            </Link>
          </div>
          <div {...stylex.props(s.familyGrid)}>
            {families.map((family) => (
              <div key={family.en}>
                <h3 {...stylex.props(s.familyTitle)}>{cn ? family.cn : family.en}</h3>
                <ul {...stylex.props(s.familyList)}>
                  {family.items.map(([name, path]) => (
                    <li key={path}>
                      <NextLink
                        href={`/${locale}/docs/react/components/${path}`}
                        {...stylex.props(s.familyLink)}
                      >
                        {name}
                        <span aria-hidden="true">↗</span>
                      </NextLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="built-title" {...stylex.props(s.built)}>
          <div>
            <p {...stylex.props(s.eyebrow)}>
              {cn ? "好体验，也要有好基础" : "THE FEELING HAS A FOUNDATION"}
            </p>
            <h2 id="built-title" {...stylex.props(s.sectionTitle)}>
              {cn ? (
                <>
                  表面之下，
                  <br />
                  同样用心。
                </>
              ) : (
                <>
                  Thought through.
                  <br />
                  All the way down.
                </>
              )}
            </h2>
            <Link render={<NextLink href={`/${locale}/docs/react/getting-started/architecture`} />}>
              {cn ? "了解设计与架构" : "Inside the architecture"} ↗
            </Link>
          </div>
          <Accordion xstyle={s.accordion} defaultValue={["interaction"]}>
            {[
              {
                id: "interaction",
                title: cn ? "交互不是装饰" : "Interaction, not decoration",
                content: cn
                  ? "UI SDK 负责焦点、键盘、选择与浮层行为。Lenso 在同一套交互之上，构建熟悉而一致的视觉语言。"
                  : "UI SDK owns focus, keyboard navigation, selection and overlays. Lenso brings a familiar visual language to those shared interactions.",
              },
              {
                id: "appearance",
                title: cn ? "外观不是一层皮肤" : "A system, not a skin",
                content: cn
                  ? "StyleX 与语义化设计令牌共同定义组件外观，让浅色、深色和材质保持一致。玻璃用于浮动控件，内容仍然清晰。"
                  : "StyleX and semantic tokens keep light, dark and material treatments connected. Glass belongs on floating controls; content stays clear.",
              },
              {
                id: "composition",
                title: cn ? "组合，不是重新实现" : "Compose instead of reinventing",
                content: cn
                  ? "从按钮到复杂表单，用公开的组件部件进行组合。保留原生事件、值模型与可访问语义。"
                  : "Compose public component parts, from a button to a complete form. Keep native events, value models and accessible semantics intact.",
              },
            ].map((item) => (
              <Accordion.Item key={item.id} value={item.id}>
                <Accordion.Heading>
                  <Accordion.Trigger>
                    {item.title}
                    <Accordion.Indicator>
                      <ChevronDown />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>{item.content}</Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </section>
        <section {...stylex.props(s.closing)}>
          <p {...stylex.props(s.eyebrow)}>YOUR NEXT GREAT IDEA</p>
          <h2 {...stylex.props(s.closingTitle)}>
            {cn ? "现在，轮到你的作品。" : "Now, make it yours."}
          </h2>
          <Button
            role="link"
            variant="prominent"
            size="lg"
            render={<NextLink href={`/${locale}/docs/react/getting-started`} />}
          >
            {cn ? "开始使用 Lenso" : "Get started with Lenso"} ↗
          </Button>
        </section>
      </main>
      <footer {...stylex.props(s.footer)}>
        <span>
          Lenso UI{" "}
          <span {...stylex.props(s.footerNote)}>
            {cn ? "熟悉的交互。新的可能。" : "Familiar by design. Yours by nature."}
          </span>
        </span>
        <div {...stylex.props(s.footerLinks)}>
          <Link render={<NextLink href={`/${locale}/docs/react/getting-started`} />}>
            {cn ? "文档" : "Documentation"}
          </Link>
          <Link href={product.repository}>GitHub ↗</Link>
        </div>
      </footer>
    </HomeShell>
  );
}
