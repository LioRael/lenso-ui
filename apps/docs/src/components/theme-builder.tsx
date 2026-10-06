"use client";

// Adapted from HeroUI v3.2.6 themes page/header/code panel, Apache-2.0.
// Modified: Lenso identity, StyleX, native controls, validated URL state and scoped portals.
import {
  Suspense,
  useEffect,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import * as stylex from "@stylexjs/stylex";
import {
  ArrowUturnCcwLeft,
  ArrowUturnCwRight,
  ArrowRotateLeft,
  Code,
  Moon,
  NodesRight,
  Shuffle,
  Sun,
  BucketPaint,
  ChevronsExpandVertical,
} from "@gravity-ui/icons";
import { Button, Modal, Tabs, ThemeScope } from "@lenso/ui";
import {
  AccentControl,
  BaseControl,
  BuilderControls,
  FontControl,
  PresetChoices,
  RadiusControl,
  type AppearanceKey,
} from "./theme-builder-controls";
import { ThemeBuilderCode } from "./theme-builder-code";
import { ThemeBuilderPreview } from "./theme-builder-preview";
import { ThemeBuilderDashboard } from "./theme-builder-dashboard";
import { ThemeBuilderMail } from "./theme-builder-mail";
import { ThemeBuilderChat } from "./theme-builder-chat";
import { ThemeBuilderFinances } from "./theme-builder-finances";
import { useThemeBuilderState } from "./use-theme-builder-state";
import { builderShareURL } from "@/lib/theme-builder-query";
import { builder as s } from "@/styles/theme-builder.stylex";
import {
  builderTheme,
  builderVariables,
  defaultThemeVariables,
  getBuilderFont,
  fonts,
  formRadiusOptions,
  radiusOptions,
  themes,
  findMatchingTheme,
  type BuilderSettings,
} from "@/lib/theme-builder-model";

const previews = ["components", "dashboard", "mail", "chat", "finances"] as const;
type Preview = (typeof previews)[number];

function subscribeDocumentTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
function readDocumentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
const subscribeHydration = () => () => {};

function PreviewTabs() {
  return (
    <Tabs.ListContainer>
      <Tabs.List aria-label="Preview templates" xstyle={s.tabs}>
        {previews.map((value) => (
          <Tabs.Tab key={value} value={value} xstyle={s.tab}>
            {value === "components" ? "Components" : value[0]!.toUpperCase() + value.slice(1)}
          </Tabs.Tab>
        ))}
        <Tabs.Indicator />
      </Tabs.List>
    </Tabs.ListContainer>
  );
}

export function ThemeBuilder({ locale }: { locale: "en" | "cn" }) {
  return (
    <Suspense fallback={<output>Loading Theme Builder…</output>}>
      <NuqsAdapter>
        <ThemeBuilderEditor locale={locale} />
      </NuqsAdapter>
    </Suspense>
  );
}

function ThemeBuilderEditor({ locale }: { locale: "en" | "cn" }) {
  const { settings, replace, undo, redo, canUndo, canRedo } = useThemeBuilderState();
  const [status, setStatus] = useState("");
  const { setTheme: setMode } = useTheme();
  // The system class can be applied before next-themes fills resolvedTheme.
  // Follow the rendering document so the first preview and its portals agree.
  const mode = useSyncExternalStore(
    subscribeDocumentTheme,
    readDocumentTheme,
    () => "light" as const,
  );
  const ready = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  const [tab, setTab] = useState<Preview>("components");
  const [codeOpen, setCodeOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [locks, setLocks] = useState<ReadonlySet<AppearanceKey>>(new Set());
  const update = (changes: Partial<BuilderSettings>) => replace({ ...settings, ...changes });

  useEffect(() => {
    if (settings.fontFamily === "inter") return;
    const font = getBuilderFont(settings.fontFamily);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = font.cdnUrl;
    document.head.append(link);
    return () => link.remove();
  }, [settings.fontFamily]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          "input,textarea,select,[contenteditable],[role=slider],[role=listbox],[role=dialog],[role=tablist],[role=tabpanel],[data-theme-example]",
        )
      )
        return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        if (event.key === "ArrowLeft") undo();
        else redo();
      }
    };
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [undo, redo]);

  function shuffle() {
    const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)]!;
    const range = (min: number, max: number) =>
      Math.round((min + Math.random() * (max - min)) * 100) / 100;
    const changes: Partial<BuilderSettings> = {
      base: Math.random() * 0.02,
      chroma: range(0.1, 0.26),
      lightness: range(0.5, 0.85),
      hue: Math.floor(Math.random() * 360),
      fontFamily: pick(fonts).id,
      radius: pick(radiusOptions).id,
      formRadius: pick(formRadiusOptions).id,
    };
    for (const key of locks) delete changes[key];
    update(changes);
  }
  const controls = {
    settings,
    update,
    locks,
    toggleLock: (key: AppearanceKey) =>
      setLocks((previous) => {
        const next = new Set(previous);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      }),
  };
  async function importSettings(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    try {
      if (file.size > 65536) throw new Error("Too large");
      replace(JSON.parse(await file.text()));
      setStatus("Theme imported.");
    } catch {
      setStatus("Import failed. Choose a valid builder JSON file (up to 64 KB).");
    } finally {
      input.value = "";
    }
  }
  const theme = builderTheme(settings);
  return (
    <ThemeScope
      theme={ready ? mode : undefined}
      data-lenso-theme={theme.name}
      data-testid="theme-builder"
      style={ready ? (builderVariables(settings, mode) as CSSProperties) : undefined}
      xstyle={s.scope}
    >
      <Tabs value={tab} onValueChange={(value) => setTab(value as Preview)} xstyle={s.page}>
        <h1 {...stylex.props(s.hidden)}>{locale === "cn" ? "主题配置中心" : "Theme Builder"}</h1>
        <header {...stylex.props(s.header)}>
          <div {...stylex.props(s.row)}>
            <Link href={`/${locale}/docs/react/getting-started`} {...stylex.props(s.brand)}>
              Lenso UI
            </Link>
            <div {...stylex.props(s.row)}>
              <div {...stylex.props(s.row, s.desktop)}>
                <Button
                  variant="tertiary"
                  aria-label="Undo"
                  title="Undo"
                  disabled={!canUndo}
                  onClick={undo}
                  xstyle={s.icon}
                >
                  <ArrowUturnCcwLeft width={16} height={16} />
                </Button>
                <Button
                  variant="tertiary"
                  aria-label="Redo"
                  title="Redo"
                  disabled={!canRedo}
                  onClick={redo}
                  xstyle={s.icon}
                >
                  <ArrowUturnCwRight width={16} height={16} />
                </Button>
                <span {...stylex.props(s.divider)} />
              </div>
              <Button
                variant="tertiary"
                aria-label="Reset theme"
                title="Reset theme"
                onClick={() => replace(defaultThemeVariables)}
                xstyle={s.icon}
              >
                <ArrowRotateLeft width={16} height={16} />
              </Button>
              <Button
                variant="tertiary"
                aria-label="Shuffle theme"
                title="Shuffle theme"
                onClick={shuffle}
                xstyle={[s.icon, s.notPhone]}
              >
                <Shuffle width={16} height={16} />
              </Button>
            </div>
          </div>
          <div {...stylex.props(s.row, s.headerActions)}>
            <div {...stylex.props(s.mode)}>
              <Button
                variant="ghost"
                aria-label="Light theme"
                aria-pressed={mode === "light"}
                onClick={() => setMode("light")}
                xstyle={[s.modeButton, mode === "light" && s.selectedMode]}
              >
                <Sun width={14} height={14} />
              </Button>
              <Button
                variant="ghost"
                aria-label="Dark theme"
                aria-pressed={mode === "dark"}
                onClick={() => setMode("dark")}
                xstyle={[s.modeButton, mode === "dark" && s.selectedMode]}
              >
                <Moon width={14} height={14} />
              </Button>
            </div>
            <Button
              variant="tertiary"
              aria-label="Share theme"
              title="Share theme"
              xstyle={s.icon}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    builderShareURL(window.location.origin, window.location.pathname, settings),
                  );
                  setStatus("Theme link copied.");
                } catch {
                  setStatus("Clipboard unavailable. Export the theme instead.");
                }
              }}
            >
              <NodesRight width={16} height={16} />
            </Button>
            <Button
              variant={codeOpen ? "primary" : "tertiary"}
              aria-label="View code"
              title="View code"
              aria-expanded={codeOpen}
              onClick={() => setCodeOpen(!codeOpen)}
              xstyle={[s.icon, s.desktop]}
            >
              <Code width={16} height={16} />
            </Button>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} {...stylex.props(s.content)}>
          <div {...stylex.props(s.previewNavigation)}>
            <PreviewTabs />
          </div>
          <div {...stylex.props(s.frame)}>
            <Tabs.Panel
              value="components"
              keepMounted
              xstyle={[s.templatePanel, tab !== "components" && s.inactivePreview]}
            >
              <div {...stylex.props(s.preview)}>
                <ThemeBuilderPreview />
              </div>
            </Tabs.Panel>
            {(
              [
                ["dashboard", ThemeBuilderDashboard],
                ["mail", ThemeBuilderMail],
                ["chat", ThemeBuilderChat],
                ["finances", ThemeBuilderFinances],
              ] as const
            ).map(([name, Example]) => (
              <Tabs.Panel
                key={name}
                value={name}
                keepMounted
                xstyle={[s.templatePanel, tab !== name && s.inactivePreview]}
              >
                <section
                  data-theme-example={name}
                  aria-label={`${name} local example`}
                  {...stylex.props(s.application)}
                >
                  <Example />
                </section>
              </Tabs.Panel>
            ))}
          </div>
        </main>
        <footer {...stylex.props(s.footer)}>
          <BuilderControls {...controls} />
        </footer>
        <div {...stylex.props(s.phoneSpace)} />
        <div {...stylex.props(s.mobileFooter)}>
          <Modal.Root open={sheetOpen} onOpenChange={setSheetOpen}>
            <Modal.Trigger
              aria-label="Theme settings"
              render={<Button variant="secondary" />}
              xstyle={s.mobileThemeInput}
            >
              <BucketPaint width={16} height={16} />
              {themes.find((theme) => theme.id === findMatchingTheme(settings))?.label ?? "Custom"}
              <ChevronsExpandVertical width={12} height={12} />
            </Modal.Trigger>
            <Modal.Portal>
              <Modal.Backdrop xstyle={s.sheetBackdrop} />
              <Modal.Viewport>
                <Modal.Popup placement="bottom" xstyle={s.sheet}>
                  <Modal.Title xstyle={s.hidden}>Theme settings</Modal.Title>
                  <Modal.Close aria-label="Close theme settings" />
                  <div {...stylex.props(s.sheetHandle)} />
                  <PresetChoices settings={settings} update={update} mobile />
                  <div {...stylex.props(s.mobileColorRow)}>
                    <AccentControl {...controls} />
                    <BaseControl {...controls} />
                  </div>
                  <div {...stylex.props(s.mobileControlRow)}>
                    <FontControl {...controls} />
                    <RadiusControl {...controls} />
                    <RadiusControl field {...controls} />
                  </div>
                </Modal.Popup>
              </Modal.Viewport>
            </Modal.Portal>
          </Modal.Root>
          <Button variant="tertiary" aria-label="Shuffle theme" onClick={shuffle} xstyle={s.icon}>
            <Shuffle width={16} height={16} />
          </Button>
        </div>
        {codeOpen && (
          <ThemeBuilderCode
            settings={settings}
            mode={mode}
            close={() => setCodeOpen(false)}
            report={setStatus}
            importSettings={importSettings}
          />
        )}
        <output aria-live="polite" {...stylex.props(s.status)}>
          {status}
        </output>
      </Tabs>
    </ThemeScope>
  );
}
