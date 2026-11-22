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
import { GlassButton } from "@lenso/ui/glass-button";
import { List } from "@lenso/ui/list";
import { Modal } from "@lenso/ui/modal";
import { Radio } from "@lenso/ui/radio";
import { RadioGroup } from "@lenso/ui/radio-group";
import { Sheet } from "@lenso/ui/sheet";
import { Sidebar } from "@lenso/ui/sidebar";
import { Switch } from "@lenso/ui/switch";
import { docsSettings as s } from "@lenso/docs/presentation";
import type { DocumentationLocale } from "./document-model";
import { useDocsDesignTheme } from "./docs-design-theme-context";
import { GlassAppearance, ThemePresets } from "./docs-theme-panel";
import { themes } from "./docs-theme-presets";
import { useDocumentationMessages } from "./i18n";

export interface DocsSettingsPanelProps {
  locale: "en" | "cn";
  alternates: readonly (DocumentationLocale & { url: string })[];
  onLanguageSelect: () => void;
  split: boolean;
}

type SettingsCategory = "appearance" | "theme" | "language";
type MobileSettingsPage = SettingsCategory | "overview" | "glass";
const settingsSnapPoints = [0.58, 1];

export default function DocsSettingsOverlay({
  open,
  onOpenChange,
  finalFocus,
  ...panel
}: Omit<DocsSettingsPanelProps, "onLanguageSelect"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  finalFocus: () => HTMLButtonElement | null;
}) {
  const cn = panel.locale === "cn";
  const closeLabel = cn ? "关闭设置" : "Close settings";
  if (!panel.split)
    return (
      <Sheet open={open} onOpenChange={onOpenChange} snapPoints={settingsSnapPoints}>
        <Sheet.Backdrop />
        <Sheet.Content finalFocus={finalFocus} surfaceXstyle={s.sheetSurface}>
          <DocsSettingsPanel {...panel} onLanguageSelect={() => onOpenChange(false)} />
        </Sheet.Content>
      </Sheet>
    );
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Backdrop />
      <Modal.Content placement="center" xstyle={s.dialog} finalFocus={finalFocus}>
        <Modal.Close aria-label={closeLabel} xstyle={s.dialogClose} />
        <DocsSettingsPanel {...panel} onLanguageSelect={() => onOpenChange(false)} />
      </Modal.Content>
    </Modal>
  );
}

function DocsSettingsPanel({
  locale,
  alternates,
  onLanguageSelect,
  split,
}: DocsSettingsPanelProps) {
  const cn = locale === "cn";
  const messages = useDocumentationMessages();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { active, glassTint } = useDocsDesignTheme();
  const [category, setCategory] = useState<SettingsCategory | null>(split ? "appearance" : null);
  const [glassOpen, setGlassOpen] = useState(false);
  const mobilePage: MobileSettingsPage = glassOpen ? "glass" : (category ?? "overview");
  const [leaving, setLeaving] = useState<{
    page: MobileSettingsPage;
    back: boolean;
  } | null>(null);
  const glassRow = useRef<HTMLButtonElement>(null);
  const glassBack = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  const mobileBack = useRef<HTMLButtonElement>(null);
  const mobileRows = useRef<Partial<Record<SettingsCategory, HTMLElement | null>>>({});
  const mobileReturn = useRef<SettingsCategory | null>(null);
  useLayoutEffect(() => {
    if (!mobileReturn.current) return;
    if (category) mobileBack.current?.focus();
    else {
      mobileRows.current[mobileReturn.current]?.focus();
      mobileReturn.current = null;
    }
  }, [category]);
  useLayoutEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (glassOpen ? glassBack : glassRow).current?.focus();
  }, [glassOpen]);
  const detailHeading = useId();
  const detailId = useId();
  const glassHint = useId();
  const settingsLabel = cn ? "设置" : "Settings";
  const categoriesLabel = cn ? "设置分类" : "Settings categories";
  const backToAppearance = cn ? "返回外观" : "Back to Appearance";
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
  const appearance = (
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
              if (!split) setLeaving({ page: mobilePage, back: false });
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
  );
  const language =
    alternates.length > 1 ? (
      <section aria-labelledby={detailHeading} {...stylex.props(s.section)}>
        <List aria-labelledby={detailHeading}>
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
      <Fieldset.Group>
        <Fieldset.Row xstyle={[s.stackedRow, s.presetsRow]}>
          <ThemePresets locale={locale} />
        </Fieldset.Row>
      </Fieldset.Group>
    </Fieldset>
  );

  const categories = [
    {
      id: "appearance",
      label: appearanceLabel,
      icon: Display,
      tone: s.neutral,
      value: automatic ? automaticLabel : modes.find(({ value }) => value === colorScheme)?.label,
      content: appearance,
    },
    {
      id: "theme",
      label: themeLabel,
      icon: BucketPaint,
      tone: s.purple,
      value: active === "default" && cn ? "默认" : themes.find(({ id }) => id === active)?.label,
      content: presets,
    },
    ...(language
      ? [
          {
            id: "language" as const,
            label: languageLabel,
            icon: Globe,
            tone: s.blue,
            value: alternates.find(({ code }) => code === locale)?.label,
            content: language,
          },
        ]
      : []),
  ] as const;
  const current = categories.find(({ id }) => id === category) ?? categories[0];
  const glassDetail = (
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
  );
  if (!split) {
    return (
      <>
        <Sheet.Handle xstyle={s.sheetHandle} />
        <Sheet.Header xstyle={s.sheetHeader}>
          {category && (
            <GlassButton
              ref={glassOpen ? glassBack : mobileBack}
              isIconOnly
              size="sm"
              xstyle={s.sheetButton}
              aria-label={glassOpen ? backToAppearance : cn ? "返回设置" : "Back to Settings"}
              onClick={() => {
                setLeaving({ page: mobilePage, back: true });
                if (glassOpen) {
                  moveFocus.current = true;
                  setGlassOpen(false);
                } else {
                  setCategory(null);
                }
              }}
            >
              <ChevronLeft width={18} height={18} aria-hidden="true" {...stylex.props(s.chevron)} />
            </GlassButton>
          )}
          <Sheet.Title id={detailHeading} xstyle={category ? s.sheetTitle : s.sheetLargeTitle}>
            {glassOpen ? glassLabel : category ? current.label : settingsLabel}
          </Sheet.Title>
          <Sheet.Close aria-label={cn ? "关闭设置" : "Close settings"} xstyle={s.sheetClose} />
        </Sheet.Header>
        <div {...stylex.props(s.sheetPages)}>
          {(leaving ? [leaving.page, mobilePage] : [mobilePage]).map((page) => {
            const outgoing = page === leaving?.page;
            return (
              <Sheet.Body
                key={page}
                inert={outgoing}
                aria-hidden={outgoing || undefined}
                xstyle={[
                  s.sheetBody,
                  leaving && (leaving.back ? s.sheetPop : s.sheetPush),
                  leaving && s.sheetPageMotion,
                  leaving?.back === outgoing && s.sheetTopPage,
                  leaving && (outgoing ? s.sheetExit : s.sheetEnter),
                ]}
                onAnimationEnd={
                  outgoing
                    ? (event) => {
                        if (event.target === event.currentTarget) setLeaving(null);
                      }
                    : undefined
                }
              >
                {page === "glass" ? (
                  glassDetail
                ) : page !== "overview" ? (
                  categories.find(({ id }) => id === page)?.content
                ) : (
                  <List aria-label={categoriesLabel}>
                    {categories.map(({ id, label, icon: Icon, tone, value }) => (
                      <List.Item key={id} xstyle={s.sheetItem}>
                        <Button
                          ref={(node) => {
                            mobileRows.current[id] = node;
                          }}
                          variant="borderless"
                          xstyle={[s.glassRow, s.sheetRow]}
                          onClick={() => {
                            setLeaving({ page: mobilePage, back: false });
                            mobileReturn.current = id;
                            setCategory(id);
                          }}
                        >
                          <span {...stylex.props(s.sheetRowLabel)}>
                            <span {...stylex.props(s.categoryIcon, s.sheetIcon, tone)}>
                              <Icon width={17} height={17} aria-hidden="true" />
                            </span>
                            {label}
                          </span>
                          <span {...stylex.props(s.glassValue, s.sheetValue)}>
                            {value}
                            <ChevronRight
                              width={14}
                              height={14}
                              aria-hidden="true"
                              {...stylex.props(s.chevron, s.sheetChevron)}
                            />
                          </span>
                        </Button>
                      </List.Item>
                    ))}
                  </List>
                )}
              </Sheet.Body>
            );
          })}
        </div>
      </>
    );
  }
  return (
    <div {...stylex.props(s.split)}>
      <Sidebar aria-label={categoriesLabel} xstyle={s.sidebar}>
        <Sidebar.Header xstyle={s.sidebarHeader}>
          <Modal.Title xstyle={s.sidebarTitle}>{settingsLabel}</Modal.Title>
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
              aria-label={backToAppearance}
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
          {glassOpen ? glassDetail : current.content}
        </div>
      </section>
    </div>
  );
}
