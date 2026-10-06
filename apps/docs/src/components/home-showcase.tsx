"use client";

// Copyright 2025 NextUI Inc. SPDX-License-Identifier: Apache-2.0.
// Adapted from HeroUI v3.2.6 apps/docs/src/app/[lang]/(home)/components/demo-showcase.tsx,
// e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e.
// Modified: native associated panels, local applications and isolated accent ownership.
// License: third-party/heroui/LICENSE.txt.
import { useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { ColorSwatchPicker, Link, Tabs, ThemeScope } from "@lenso/ui";
import { Palette } from "@gravity-ui/icons";
import { converter } from "culori";
import type { Color } from "react-aria-components";
import * as stylex from "@stylexjs/stylex";
import {
  builderVariables,
  defaultThemeVariables,
  themeValuesById,
} from "@/lib/theme-builder-model";
import { homeShowcase as s } from "@/styles/home-showcase.stylex";
import { useDocsDesignTheme } from "./docs-design-theme";
import { ThemeBuilderPreview } from "./theme-builder-preview";
import { ThemeBuilderDashboard } from "./theme-builder-dashboard";
import { ThemeBuilderMail } from "./theme-builder-mail";
import { ThemeBuilderChat } from "./theme-builder-chat";
import { ThemeBuilderFinances } from "./theme-builder-finances";
import { PreviewActivityProvider } from "./preview-activity";

const previews = [
  { value: "components", en: "Components", cn: "组件" },
  { value: "dashboard", en: "Dashboard", cn: "仪表盘", Example: ThemeBuilderDashboard },
  { value: "mail", en: "Mail", cn: "邮件", Example: ThemeBuilderMail },
  { value: "chat", en: "Chat", cn: "聊天", Example: ThemeBuilderChat },
  { value: "finances", en: "Finances", cn: "财务", Example: ThemeBuilderFinances },
] as const;
type Preview = (typeof previews)[number]["value"];
const colors = [
  "#FF81B9",
  "#FF8289",
  "#FF9A00",
  "#DCBE00",
  "#72DB5A",
  "#00D7FF",
  "#5DBFFF",
  "#A8ABFF",
] as const;
const toOklch = converter("oklch");
const desktopQuery = "(min-width: 1024px)";

function subscribeViewport(notify: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
function desktopSnapshot() {
  return window.matchMedia(desktopQuery).matches;
}
function mobileServerSnapshot() {
  return false;
}
function subscribeMode(notify: () => void) {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
  return () => observer.disconnect();
}
function modeSnapshot() {
  const root = document.documentElement;
  return root.classList.contains("dark") || root.dataset["theme"] === "dark" ? "dark" : "light";
}
function serverModeSnapshot(): undefined {
  return undefined;
}

export function HomeShowcase({ locale }: { locale: "en" | "cn" }) {
  const componentsRef = useRef<HTMLDivElement>(null);
  const [desktopSelection, setDesktopSelection] = useState<Preview>("components");
  const [color, setColor] = useState<Color>();
  const { active, vibrant } = useDocsDesignTheme();
  const desktop = useSyncExternalStore(subscribeViewport, desktopSnapshot, mobileServerSnapshot);
  const mode = useSyncExternalStore(subscribeMode, modeSnapshot, serverModeSnapshot);
  const selected = desktop ? desktopSelection : "components";
  const seed = color ? toOklch(color.toString("css")) : undefined;
  const settings = {
    ...defaultThemeVariables,
    ...(seed && { lightness: seed.l, chroma: seed.c, hue: seed.h ?? 0 }),
  };
  const generated = seed && mode ? builderVariables(settings, mode) : undefined;
  // ThemeScope redeclares native live mixes for this accent. Preserve the header
  // owner's baseline, rather than resetting its neutrals, fonts or radii.
  const scopeStyle = mode
    ? ({
        ...builderVariables({ ...themeValuesById[active], vibrantPalette: vibrant }, mode),
        ...(generated && {
          "--accent": generated["--accent"],
          "--accent-foreground": generated["--accent-foreground"],
          "--focus": generated["--focus"],
        }),
      } as CSSProperties)
    : undefined;
  const linkSeed = seed ? settings : themeValuesById[active];
  const query = `?${new URLSearchParams({
    lightness: String(linkSeed.lightness),
    chroma: String(linkSeed.chroma),
    hue: String(linkSeed.hue),
  })}`;
  const builderLabel = locale === "cn" ? "在主题配置中心编辑" : "Open Theme Builder";

  return (
    <ThemeScope data-home-showcase="" theme={mode} style={scopeStyle} xstyle={s.scope}>
      <Tabs
        value={selected}
        orientation="horizontal"
        onValueChange={(value) => {
          if (previews.some((preview) => preview.value === value))
            setDesktopSelection(value as Preview);
        }}
        xstyle={s.root}
      >
        <div {...stylex.props(s.toolbar)}>
          <Tabs.ListContainer>
            <Tabs.List
              aria-label={locale === "cn" ? "演示预览" : "Demo previews"}
              xstyle={s.tabList}
            >
              {previews.map((preview) => (
                <Tabs.Tab key={preview.value} value={preview.value} xstyle={s.tab}>
                  {preview[locale]}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.ListContainer>
          <div {...stylex.props(s.palette)}>
            <ColorSwatchPicker
              aria-label={locale === "cn" ? "演示强调色" : "Showcase accent"}
              onChange={setColor}
              size="sm"
              xstyle={s.swatches}
            >
              {colors.map((hex) => (
                <ColorSwatchPicker.Item
                  key={hex}
                  color={hex}
                  aria-label={`${locale === "cn" ? "强调色" : "Accent"} ${hex}`}
                  xstyle={s.swatchHit}
                >
                  <ColorSwatchPicker.Swatch xstyle={s.swatch} />
                  <ColorSwatchPicker.Indicator />
                </ColorSwatchPicker.Item>
              ))}
            </ColorSwatchPicker>
            <Link
              href={`/${locale}/theme-builder${query}`}
              aria-label={builderLabel}
              title={builderLabel}
              xstyle={s.builderLink}
            >
              <Palette aria-hidden="true" {...stylex.props(s.icon)} />
            </Link>
          </div>
        </div>
        <div data-home-showcase-frame="" {...stylex.props(s.frame)}>
          <Tabs.Panel
            ref={componentsRef}
            value="components"
            keepMounted
            hidden={false}
            inert={selected !== "components"}
            aria-hidden={selected !== "components" || undefined}
            xstyle={[s.components, selected !== "components" && s.sizingOnly]}
          >
            <ThemeBuilderPreview />
          </Tabs.Panel>
          {previews.map((preview) =>
            "Example" in preview ? (
              <Tabs.Panel
                key={preview.value}
                value={preview.value}
                keepMounted
                inert={selected !== preview.value}
                aria-hidden={selected !== preview.value || undefined}
                xstyle={[s.application, selected !== preview.value && s.inactive]}
              >
                <PreviewActivityProvider
                  active={selected === preview.value}
                  returnFocus={componentsRef}
                >
                  <preview.Example />
                </PreviewActivityProvider>
              </Tabs.Panel>
            ) : null,
          )}
        </div>
      </Tabs>
    </ThemeScope>
  );
}
