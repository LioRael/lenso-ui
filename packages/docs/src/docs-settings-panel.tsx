"use client";

import * as stylex from "@stylexjs/stylex";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "fumadocs-ui/provider/base";
import Link from "fumadocs-core/link";
import {
  BucketPaint,
  Check,
  ChevronLeft,
  ChevronRight,
  Display,
  Globe,
  Magnifier,
} from "@gravity-ui/icons";
import { Button } from "@lenso/ui/button";
import { Fieldset } from "@lenso/ui/fieldset";
import { Glass } from "@lenso/ui/glass";
import { List } from "@lenso/ui/list";
import { Modal } from "@lenso/ui/modal";
import { Radio } from "@lenso/ui/radio";
import { RadioGroup } from "@lenso/ui/radio-group";
import { SegmentedControl } from "@lenso/ui/segmented-control";
import { Sidebar } from "@lenso/ui/sidebar";
import { Switch } from "@lenso/ui/switch";
import { docsSettings as s } from "@lenso/docs/presentation";
import type { DocumentationLocale } from "./document-model";
import { useDocsDesignTheme } from "./docs-design-theme-context";
import { GlassAppearance, ThemePresets } from "./docs-theme-panel";
import { useDocumentationMessages } from "./i18n";

export interface DocsSettingsPanelProps {
  locale: "en" | "cn";
  alternates: readonly (DocumentationLocale & { url: string })[];
  onLanguageSelect: () => void;
  split: boolean;
}

export default function DocsSettingsPanel({
  locale,
  alternates,
  onLanguageSelect,
  split,
}: DocsSettingsPanelProps) {
  const cn = locale === "cn";
  const messages = useDocumentationMessages();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { glassTint } = useDocsDesignTheme();
  const [category, setCategory] = useState("appearance");
  const [glassOpen, setGlassOpen] = useState(false);
  const glassRow = useRef<HTMLButtonElement>(null);
  const glassBack = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (glassOpen ? glassBack : glassRow).current?.focus();
  }, [glassOpen]);
  const detailHeading = useId();
  const detailId = useId();
  const glassHint = useId();
  const languageHeading = useId();
  const appearanceLabel = cn ? "外观" : "Appearance";
  const glassLabel = cn ? "玻璃外观" : "Glass appearance";
  const languageLabel = cn ? "语言" : "Language";
  const themeLabel = cn ? "主题" : "Theme";
  const automaticLabel = cn ? "自动" : "Automatic";
  const glassValue =
    glassTint === 0.5
      ? cn
        ? "默认"
        : "Default"
      : glassTint < 0.5
        ? cn
          ? "更清透"
          : "More clear"
        : cn
          ? "更浓染"
          : "More tinted";
  const automatic = (theme ?? "system") === "system";
  const colorScheme = resolvedTheme === "dark" ? "dark" : "light";
  const modes = [
    { value: "light", label: cn ? "浅色" : "Light" },
    { value: "dark", label: cn ? "深色" : "Dark" },
  ] as const;
  const colorMode = (
    <Fieldset.Row xstyle={s.stackedRow}>
      <SegmentedControl
        aria-label={messages.colorTheme}
        items={[...modes, { value: "system", label: cn ? "自动" : "Auto" }]}
        value={theme ?? "system"}
        onValueChange={(value) => {
          if (value) setTheme(value);
        }}
        xstyle={s.mode}
      />
    </Fieldset.Row>
  );
  const glassAppearance = (
    <Fieldset.Row xstyle={s.stackedRow}>
      <GlassAppearance locale={locale} />
    </Fieldset.Row>
  );
  const appearance = split ? (
    <div {...stylex.props(s.detailGroups)}>
      <Fieldset xstyle={s.section}>
        <Fieldset.Legend xstyle={s.detailLegend}>{appearanceLabel}</Fieldset.Legend>
        <Fieldset.Group>
          <Fieldset.Row xstyle={s.previewRow}>
            <RadioGroup
              aria-label={messages.colorTheme}
              value={colorScheme}
              onValueChange={(value) => {
                if (value === "light" || value === "dark") setTheme(value);
              }}
              xstyle={s.choices}
            >
              {modes.map(({ value, label }) => (
                <Radio
                  key={value}
                  value={value}
                  xstyle={s.choice}
                  onClick={() => {
                    if (automatic && value === colorScheme) setTheme(value);
                  }}
                >
                  <span
                    aria-hidden="true"
                    {...stylex.props(s.preview, value === "dark" && s.previewDark)}
                  >
                    <svg viewBox="0 0 104 150" {...stylex.props(s.previewWallpaper)}>
                      <path
                        d="M104 8C97 50 30 44 0 72V98C34 68 96 71 104 39Z"
                        fill="var(--appearance-preview-ribbon)"
                      />
                      <path
                        d="M0 72C29 44 97 50 104 8V23C93 49 42 51 0 86Z"
                        fill="var(--appearance-preview-highlight)"
                      />
                      <path
                        d="M104 53C93 87 43 84 16 108C6 117 2 127 0 136V150H75C43 132 68 114 87 99C99 89 104 80 104 72Z"
                        fill="var(--appearance-preview-ribbon)"
                      />
                      <path
                        d="M0 136C10 94 90 96 104 53M75 150C41 130 72 113 87 99C98 89 104 79 104 72"
                        fill="none"
                        stroke="var(--appearance-preview-highlight)"
                        strokeWidth="0.8"
                      />
                    </svg>
                    <span {...stylex.props(s.previewClock)}>09:41</span>
                    <span {...stylex.props(s.previewPills)} />
                  </span>
                  {label}
                  <Radio.Control aria-hidden="true">
                    <Radio.Indicator xstyle={s.choiceCheck}>
                      <Check width={12} height={12} />
                    </Radio.Indicator>
                  </Radio.Control>
                </Radio>
              ))}
            </RadioGroup>
          </Fieldset.Row>
          <Switch
            checked={automatic}
            onCheckedChange={(checked) => setTheme(checked ? "system" : colorScheme)}
            xstyle={s.automatic}
          >
            <Switch.Content xstyle={s.settingLabel}>{automaticLabel}</Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>
        </Fieldset.Group>
      </Fieldset>
      <div>
        <Fieldset.Group>
          <Button
            ref={glassRow}
            variant="borderless"
            aria-describedby={glassHint}
            xstyle={s.glassRow}
            onClick={() => {
              moveFocus.current = true;
              setGlassOpen(true);
            }}
          >
            {glassLabel}
            <span {...stylex.props(s.glassValue)}>
              {glassValue}
              <ChevronRight
                width={14}
                height={14}
                aria-hidden="true"
                {...stylex.props(s.chevron)}
              />
            </span>
          </Button>
        </Fieldset.Group>
        <p id={glassHint} {...stylex.props(s.settingsHint)}>
          {cn
            ? "调整玻璃控件的通透程度。"
            : "Adjust how much background shows through glass controls."}
        </p>
      </div>
    </div>
  ) : (
    <Fieldset xstyle={s.section}>
      <Fieldset.Legend>{appearanceLabel}</Fieldset.Legend>
      <Fieldset.Group>
        {colorMode}
        {glassAppearance}
      </Fieldset.Group>
    </Fieldset>
  );
  const language =
    alternates.length > 1 ? (
      <section
        aria-labelledby={split ? detailHeading : languageHeading}
        {...stylex.props(s.section)}
      >
        {!split && (
          <h3 id={languageHeading} {...stylex.props(s.heading)}>
            {languageLabel}
          </h3>
        )}
        <List aria-labelledby={split ? detailHeading : languageHeading}>
          {alternates.map((alternate) => (
            <List.Item key={alternate.code} xstyle={s.languageItem}>
              <Link
                href={alternate.url}
                hrefLang={alternate.language}
                aria-current={alternate.code === locale ? "page" : undefined}
                onClick={(event) => {
                  if (
                    !event.defaultPrevented &&
                    !event.metaKey &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey
                  ) {
                    onLanguageSelect();
                  }
                }}
                {...stylex.props(s.languageLink)}
              >
                {alternate.label}
                {alternate.code === locale && (
                  <Check width={18} height={18} aria-hidden="true" {...stylex.props(s.check)} />
                )}
              </Link>
            </List.Item>
          ))}
        </List>
      </section>
    ) : null;
  const presets = (
    <Fieldset xstyle={s.section}>
      {!split && <Fieldset.Legend>{themeLabel}</Fieldset.Legend>}
      <Fieldset.Group>
        <Fieldset.Row xstyle={[s.stackedRow, s.presetsRow]}>
          <ThemePresets locale={locale} />
        </Fieldset.Row>
      </Fieldset.Group>
    </Fieldset>
  );

  if (!split) {
    return (
      <div {...stylex.props(s.sections)}>
        {appearance}
        {language}
        {presets}
      </div>
    );
  }

  const categories = [
    {
      id: "appearance",
      label: appearanceLabel,
      icon: Display,
      tone: s.neutral,
      content: appearance,
    },
    { id: "theme", label: themeLabel, icon: BucketPaint, tone: s.purple, content: presets },
    ...(language
      ? [{ id: "language", label: languageLabel, icon: Globe, tone: s.blue, content: language }]
      : []),
  ] as const;
  const current = categories.find(({ id }) => id === category) ?? categories[0];
  return (
    <div {...stylex.props(s.split)}>
      <Sidebar aria-label={cn ? "设置分类" : "Settings categories"} xstyle={s.sidebar}>
        <Sidebar.Header xstyle={s.sidebarHeader}>
          <Modal.Title xstyle={s.sidebarTitle}>{cn ? "设置" : "Settings"}</Modal.Title>
        </Sidebar.Header>
        <Sidebar.Content xstyle={s.sidebarContent}>
          <Sidebar.Group>
            {categories.map(({ id, label, icon: Icon, tone }) => (
              <Sidebar.Item
                key={id}
                render={<button type="button" aria-label={label} />}
                selected={current.id === id}
                aria-current={current.id === id ? "true" : undefined}
                aria-controls={detailId}
                onClick={() => {
                  setGlassOpen(false);
                  setCategory(id);
                }}
                xstyle={s.category}
              >
                <Sidebar.Icon xstyle={[s.categoryIcon, tone]}>
                  <Icon width={16} height={16} aria-hidden="true" />
                </Sidebar.Icon>
                <Sidebar.Text>{label}</Sidebar.Text>
              </Sidebar.Item>
            ))}
          </Sidebar.Group>
        </Sidebar.Content>
      </Sidebar>
      <section id={detailId} aria-labelledby={detailHeading} {...stylex.props(s.detail)}>
        <header {...stylex.props(s.detailHeader)}>
          {glassOpen && (
            <Button
              ref={glassBack}
              variant="borderless"
              aria-label={cn ? "返回外观" : "Back to Appearance"}
              xstyle={s.back}
              onClick={() => {
                moveFocus.current = true;
                setGlassOpen(false);
              }}
            >
              <ChevronLeft width={16} height={16} aria-hidden="true" {...stylex.props(s.chevron)} />
              {appearanceLabel}
            </Button>
          )}
          <h3 id={detailHeading} {...stylex.props(s.detailTitle)}>
            {glassOpen ? glassLabel : current.label}
          </h3>
        </header>
        <div key={glassOpen ? "glass" : current.id} {...stylex.props(s.detailBody)}>
          {glassOpen ? (
            <>
              <Fieldset.Group>
                <figure
                  aria-label={cn ? "玻璃实时预览" : "Live glass preview"}
                  {...stylex.props(s.glassScene, colorScheme === "dark" && s.glassSceneDark)}
                >
                  <div data-lenso-backdrop {...stylex.props(s.glassBackdrop)} />
                  <Glass aria-hidden="true" xstyle={s.glassSample}>
                    <Magnifier width={18} height={18} aria-hidden="true" />
                    {cn ? "搜索文档" : "Search docs"}
                  </Glass>
                </figure>
                <div {...stylex.props(s.glassAdjustments)}>
                  <GlassAppearance locale={locale} />
                </div>
              </Fieldset.Group>
              <p {...stylex.props(s.settingsHint)}>
                {cn
                  ? "清透会保留更多背景细节，浓染会让文字和控件更清晰。"
                  : "Clearer glass shows more background detail. A stronger tint makes text and controls easier to see."}
              </p>
            </>
          ) : (
            current.content
          )}
        </div>
      </section>
    </div>
  );
}
