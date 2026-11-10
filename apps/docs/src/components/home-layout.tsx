"use client";

// Copyright 2025 NextUI Inc.
// Modified: floating Liquid Glass navigation with native Lenso popover behavior.
import { type ReactNode, useEffect, useRef, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import NextLink from "fumadocs-core/link";
import { Glass, GlassButton, Link, Popover, ThemeScope } from "@lenso/ui";
import { ChevronDown, Sliders } from "@gravity-ui/icons";
import { AppearanceControls, RepositoryControl } from "./docs-site-controls";
import { CompactSearchTrigger, SearchDialog } from "./fumadocs/ui/search-dialog";
import { LanguageToggle } from "./fumadocs/ui/language-toggle";
import { homeLayout as s } from "@/styles/home-layout.stylex";
import { headerControls } from "@/styles/header-controls.stylex";
import { product } from "@/lib/product";
import type { Locale } from "@/lib/source";

export function HomeShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const cn = locale === "cn";
  const headerRef = useRef<HTMLElement>(null);
  const [overPhoto, setOverPhoto] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const header = headerRef.current!;
    const photo = header.closest("#nd-home-layout")!.querySelector("main [data-home-showcase]")!;
    const desktop = matchMedia("(min-width: 1024px)");
    let observer: IntersectionObserver;
    const observePhoto = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => entries.forEach((entry) => setOverPhoto(entry.isIntersecting)),
        { rootMargin: `-${header.clientHeight}px 0px 0px`, threshold: 0 },
      );
      observer.observe(photo);
    };
    const updateLayout = () => {
      if (desktop.matches) setMenuOpen(false);
      observePhoto();
    };
    observePhoto();
    desktop.addEventListener("change", updateLayout);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", updateLayout);
    };
  }, []);
  const links = [
    { text: cn ? "文档" : "Docs", url: `/${locale}/docs/react/getting-started` },
    { text: cn ? "组件" : "Components", url: `/${locale}/docs/react/components` },
    { text: "Agent skills", url: `/${locale}/docs/react/getting-started/skills` },
  ];
  const navigation = links.map((link) => (
    <Link key={link.url} render={<NextLink href={link.url} />} xstyle={s.navLink}>
      {link.text}
    </Link>
  ));
  return (
    <SearchDialog locale={locale}>
      <div id="nd-home-layout" {...stylex.props(s.container)}>
        <div {...stylex.props(s.headerRegion)}>
          <header ref={headerRef} {...stylex.props(s.header)}>
            <ThemeScope theme={overPhoto ? "dark" : undefined}>
              <div {...stylex.props(s.headerInner)}>
                <div {...stylex.props(s.identityGroup)}>
                  <Glass elastic render={<NextLink href={cn ? "/cn" : "/"} />} xstyle={s.brand}>
                    <span>Lenso</span>
                    <span {...stylex.props(s.brandSuffix)}>UI</span>
                  </Glass>
                  <Glass
                    elastic
                    render={<nav aria-label={cn ? "主导航" : "Main navigation"} />}
                    xstyle={s.navigation}
                  >
                    {navigation}
                  </Glass>
                </div>
                <div {...stylex.props(s.desktopActions)}>
                  <CompactSearchTrigger />
                  <Popover.Root>
                    <Popover.Trigger
                      aria-label={cn ? "外观与语言" : "Appearance and language"}
                      render={
                        <GlassButton
                          size="sm"
                          isIconOnly
                          xstyle={[headerControls.control, headerControls.icon]}
                        />
                      }
                    >
                      <Sliders width={16} height={16} aria-hidden="true" />
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Positioner align="end" sideOffset={12} collisionPadding={24}>
                        <Popover.Popup xstyle={s.mobileContent}>
                          <Popover.Title xstyle={s.mobileTitle}>
                            {cn ? "外观与语言" : "Appearance and language"}
                          </Popover.Title>
                          <div {...stylex.props(s.mobilePreferences)}>
                            <LanguageToggle locale={locale} slug="" />
                            <AppearanceControls locale={locale} />
                          </div>
                        </Popover.Popup>
                      </Popover.Positioner>
                    </Popover.Portal>
                  </Popover.Root>
                  <RepositoryControl repository={product.repository} />
                </div>
                <div {...stylex.props(s.mobileActions)}>
                  <CompactSearchTrigger />
                </div>
              </div>
              <div {...stylex.props(s.mobileMenu)}>
                <Popover.Root open={menuOpen} onOpenChange={setMenuOpen}>
                  <div {...stylex.props(s.menuTriggerPosition)}>
                    <Popover.Trigger render={<GlassButton size="lg" xstyle={s.menuTrigger} />}>
                      {cn ? "导航" : "Menu"}
                      <ChevronDown width={14} height={14} aria-hidden="true" />
                    </Popover.Trigger>
                  </div>
                  <Popover.Portal>
                    <Popover.Positioner align="end" sideOffset={12} collisionPadding={24}>
                      <Popover.Popup xstyle={s.mobileContent}>
                        <Popover.Title xstyle={s.mobileTitle}>
                          {cn ? "导航与外观" : "Navigation & appearance"}
                        </Popover.Title>
                        <nav
                          aria-label={cn ? "移动端导航" : "Mobile navigation"}
                          {...stylex.props(s.mobileNavigation)}
                        >
                          {navigation}
                        </nav>
                        <div {...stylex.props(s.mobilePreferences)}>
                          <LanguageToggle locale={locale} slug="" />
                          <AppearanceControls locale={locale} />
                        </div>
                      </Popover.Popup>
                    </Popover.Positioner>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            </ThemeScope>
          </header>
        </div>
        {children}
      </div>
    </SearchDialog>
  );
}
