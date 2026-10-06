"use client";

// HeroUI v3.2.6 home layout, Apache-2.0; adapted to Lenso's native Fumadocs shell.
// Copyright 2025 NextUI Inc.
import { type ComponentProps, type CSSProperties, type ReactNode } from "react";
import "@/styles/home-layout.css";
import * as stylex from "@stylexjs/stylex";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { Header } from "fumadocs-ui/layouts/home/slots/header";
import { DocsThemePicker } from "./docs-theme-picker";
import { CompactSearchTrigger, SearchDialog } from "./fumadocs/ui/search-dialog";
import { ThemeToggle } from "./fumadocs/ui/theme-toggle";
import { LanguageToggle } from "./fumadocs/ui/language-toggle";
import { homeLayout as s } from "@/styles/home-layout.stylex";
import { product } from "@/lib/product";
import type { Locale } from "@/lib/source";

function HomeContainer({ className, style, ref, ...props }: ComponentProps<"main">) {
  const compiled = stylex.props(s.container);
  return (
    <div
      {...props}
      id="nd-home-layout"
      className={[compiled.className, className].filter(Boolean).join(" ")}
      style={
        {
          ...compiled.style,
          "--fd-layout-width": "1400px",
          "--fd-nav-height": "56px",
          ...style,
        } as CSSProperties
      }
      ref={(element) => {
        if (typeof ref === "function") return ref(element);
        if (ref) ref.current = element;
      }}
    />
  );
}

function HomeHeader(props: ComponentProps<"header">) {
  return <Header {...props} {...stylex.props(s.header)} />;
}

export function HomeShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const cn = locale === "cn";
  return (
    <SearchDialog locale={locale}>
      <HomeLayout
        slots={{ container: HomeContainer, header: HomeHeader }}
        nav={{
          title: <span {...stylex.props(s.brand)}>Lenso UI</span>,
          url: locale === "en" ? "/" : "/cn",
          transparentMode: "none",
          children: (
            <div {...stylex.props(s.mobileActions)}>
              <CompactSearchTrigger />
              <DocsThemePicker locale={locale} />
            </div>
          ),
        }}
        githubUrl={product.repository}
        themeSwitch={{ enabled: false }}
        searchToggle={{ enabled: false }}
        i18n={false}
        links={[
          { text: cn ? "文档" : "Docs", url: `/${locale}/docs/react/getting-started` },
          { text: cn ? "主题" : "Themes", url: `/${locale}/theme-builder` },
          { text: cn ? "组件" : "Components", url: `/${locale}/docs/react/components` },
          { text: cn ? "代理工具" : "Agent tools", url: `/${locale}/docs/react/tools` },
          {
            type: "custom",
            secondary: true,
            on: "nav",
            children: (
              <div {...stylex.props(s.desktopActions)}>
                <CompactSearchTrigger />
                <DocsThemePicker locale={locale} />
                <ThemeToggle />
                <LanguageToggle locale={locale} slug="" />
              </div>
            ),
          },
          {
            type: "custom",
            on: "menu",
            secondary: true,
            children: (
              <div {...stylex.props(s.mobilePreferences)}>
                <ThemeToggle />
                <LanguageToggle locale={locale} slug="" />
              </div>
            ),
          },
        ]}
      >
        {children}
      </HomeLayout>
    </SearchDialog>
  );
}
