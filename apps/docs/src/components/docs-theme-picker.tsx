"use client";

// Adapted from HeroUI v3.2.6 DesignThemeSelector, Apache-2.0.
// Modified: native Lenso parts, shared preferences and a locale-aware partial builder handoff.
import { useId } from "react";
import NextLink from "next/link";
import * as stylex from "@stylexjs/stylex";
import { BucketPaint, Palette } from "@gravity-ui/icons";
import { Button, Link, ListBox, ListBoxItem, Popover, Switch } from "@lenso/ui";
import {
  defaultThemeVariables,
  themes,
  themeValuesById,
  type ThemeId,
} from "@/lib/theme-builder-model";
import { builderShareURL } from "@/lib/theme-builder-query";
import { docsThemePicker as s } from "@/styles/docs-theme-picker.stylex";
import { isDocsDesignTheme, useDocsDesignTheme } from "./docs-design-theme";

function presetImage(id: ThemeId) {
  return `/theme-presets/${id === "uber" ? "black" : id}.png`;
}

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
  const { active, vibrant, setActive, setVibrant } = useDocsDesignTheme();
  const descriptionId = useId();
  const cn = locale === "cn";
  const current = themes.find((theme) => theme.id === active)!;
  const named = active !== "default";
  const vibrantLabel = cn ? "鲜艳色板" : "Vibrant palette";
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Button size="sm" variant="tertiary" xstyle={[s.trigger, named && s.namedTrigger]} />
        }
        aria-label={cn ? "主题" : "Theme"}
        xstyle={s.triggerLayout}
      >
        {named ? (
          <img
            alt=""
            src={presetImage(active)}
            width={20}
            height={20}
            {...stylex.props(s.avatar)}
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
              {themes.map((theme) => (
                <ListBoxItem
                  key={theme.id}
                  itemKey={theme.id}
                  textValue={theme.label}
                  aria-label={`Apply ${theme.label} theme`}
                  xstyle={[s.item, active === theme.id && s.selectedItem]}
                >
                  <img
                    alt=""
                    src={presetImage(theme.id)}
                    width={36}
                    height={36}
                    {...stylex.props(s.image, active === theme.id && s.selectedImage)}
                  />
                  <span {...stylex.props(s.label)}>{theme.label}</span>
                </ListBoxItem>
              ))}
            </ListBox>
            <div {...stylex.props(s.details)}>
              <div {...stylex.props(s.description)}>
                <span {...stylex.props(s.vibrantLabel)}>{vibrantLabel}</span>
                <span id={descriptionId} {...stylex.props(s.vibrantHint)}>
                  {cn ? "更饱和的柔和前景色。" : "More saturated soft foreground colors."}
                </span>
              </div>
              <Switch
                aria-label={vibrantLabel}
                aria-describedby={descriptionId}
                checked={vibrant}
                onCheckedChange={setVibrant}
              >
                <Switch.Content>
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Content>
              </Switch>
            </div>
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
