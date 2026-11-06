"use client";
import { DocumentationButton } from "@lenso/docs/client";

// Adapted from HeroUI v3.2.6 DesignThemeSelector, Apache-2.0.
// Modified: native Lenso parts, shared preferences and a locale-aware partial builder handoff.
import NextLink from "fumadocs-core/link";
import * as stylex from "@stylexjs/stylex";
import { BucketPaint, Palette } from "@gravity-ui/icons";
import { Link, ListBox, ListBoxItem, Popover, Slider } from "@lenso/ui";
import {
  defaultThemeVariables,
  presetPreview,
  themes,
  themeValuesById,
  type ThemeId,
} from "@/lib/theme-builder-model";
import { builderShareURL } from "@/lib/theme-builder-query";
import { docsThemePicker as s } from "@/styles/docs-theme-picker.stylex";
import {
  isDocsDesignTheme,
  isDocsMaterialVersion,
  useDocsDesignTheme,
} from "./docs-design-theme-context";

/** Upstream intentionally seeds only the accent, not the complete selected preset. */
export function docsThemeBuilderHref(active: ThemeId, locale: "en" | "cn") {
  const { lightness, chroma, hue } = themeValuesById[active];
  const settings = { ...defaultThemeVariables, lightness, chroma, hue };
  const canonical = new URL(
    builderShareURL("https://lenso.invalid", `/${locale}/theme-builder`, settings),
  );
  const params = new URLSearchParams();
  for (const key of ["lightness", "chroma", "hue"] as const)
    params.set(key, canonical.searchParams.get(key) ?? String(settings[key]));
  return `${canonical.pathname}?${params.toString()}`;
}

export function DocsThemePicker({ locale }: { locale: "en" | "cn" }) {
  const {
    active,
    setActive,
    materialVersion,
    setMaterialVersion,
    glassTint: tint,
    setGlassTint: setTint,
  } = useDocsDesignTheme();
  const cn = locale === "cn";
  const current = themes.find((theme) => theme.id === active)!;
  const named = active !== "default";
  const avatar = stylex.props(s.avatar);
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <DocumentationButton
            size="sm"
            variant="default"
            xstyle={[s.trigger, named && s.namedTrigger]}
          />
        }
        aria-label={cn ? "主题" : "Theme"}
        xstyle={s.triggerLayout}
      >
        {named ? (
          <span
            {...avatar}
            aria-hidden="true"
            style={{ ...avatar.style, backgroundImage: presetPreview(current.variables) }}
          />
        ) : (
          <BucketPaint width={14} height={14} aria-hidden="true" {...stylex.props(s.bucket)} />
        )}
        <span {...stylex.props(s.triggerLabel)}>
          {named ? current.label : cn ? "主题" : "Theme"}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" sideOffset={8} align="end">
          <Popover.Popup xstyle={s.popup}>
            <Popover.Title xstyle={s.hidden}>{cn ? "选择主题" : "Choose theme"}</Popover.Title>
            <div {...stylex.props(s.materialSection)}>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={tint}
                onValueChange={(value) =>
                  setTint(typeof value === "number" ? value : (value[0] ?? 0.5))
                }
              >
                <Slider.Label>{cn ? "玻璃外观" : "Glass appearance"}</Slider.Label>
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Fill />
                  </Slider.Track>
                  <Slider.Thumb aria-label={cn ? "全局玻璃外观" : "Global glass appearance"} />
                </Slider.Control>
              </Slider>
              <div {...stylex.props(s.glassLegend)}>
                <span>{cn ? "更清透" : "More clear"}</span>
                <span>{cn ? "默认" : "Default"}</span>
                <span>{cn ? "更浓染" : "More tinted"}</span>
              </div>
              <DocumentationButton size="sm" onClick={() => setTint(0.5)}>
                {cn ? "恢复默认玻璃外观" : "Reset glass appearance"}
              </DocumentationButton>
            </div>
            <div {...stylex.props(s.materialSection)}>
              <span {...stylex.props(s.vibrantLabel)}>{cn ? "材质" : "Material"}</span>
              <ListBox
                aria-label={cn ? "材质版本" : "Material version"}
                selectionMode="single"
                selectedKeys={new Set([materialVersion])}
                onSelectionChange={(keys) => {
                  const version = [...keys][0];
                  if (isDocsMaterialVersion(version)) setMaterialVersion(version);
                }}
                xstyle={s.materialOptions}
              >
                {(["ios27", "ios26"] as const).map((version) => (
                  <ListBoxItem
                    key={version}
                    itemKey={version}
                    textValue={version === "ios26" ? "iOS 26" : "iOS 27"}
                  >
                    {version === "ios26" ? "iOS 26" : "iOS 27"}
                    <ListBoxItem.Indicator />
                  </ListBoxItem>
                ))}
              </ListBox>
            </div>
            <ListBox
              aria-label={cn ? "主题预设" : "Theme presets"}
              selectionMode="single"
              selectedKeys={new Set([active])}
              onSelectionChange={(keys) => {
                const id = [...keys][0];
                if (isDocsDesignTheme(id)) setActive(id);
              }}
              xstyle={s.presets}
            >
              {themes.map((theme) => {
                const swatch = stylex.props(s.swatch, active === theme.id && s.selectedSwatch);
                return (
                  <ListBoxItem
                    key={theme.id}
                    itemKey={theme.id}
                    textValue={theme.label}
                    aria-label={`Apply ${theme.label} theme`}
                    xstyle={[s.item, active === theme.id && s.selectedItem]}
                  >
                    <span
                      {...swatch}
                      aria-hidden="true"
                      style={{ ...swatch.style, backgroundImage: presetPreview(theme.variables) }}
                    />
                    <span {...stylex.props(s.label)}>{theme.label}</span>
                  </ListBoxItem>
                );
              })}
            </ListBox>
            <Link
              href={docsThemeBuilderHref(active, locale)}
              render={<NextLink href={docsThemeBuilderHref(active, locale)} />}
              xstyle={s.edit}
            >
              <Palette width={16} height={16} aria-hidden="true" />
              {cn ? "编辑主题" : "Edit Theme"}
            </Link>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
