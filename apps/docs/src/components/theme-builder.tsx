"use client";

// Adapted from HeroUI v3.2.6 themes page/header/code panel, Apache-2.0.
// Modified: Lenso identity, StyleX, native controls, validated local state and scoped portals.
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
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
  validateBuilderSettings,
  type BuilderSettings,
} from "@/lib/theme-builder-model";

interface History {
  past: BuilderSettings[];
  present: BuilderSettings;
  future: BuilderSettings[];
}
type Action = { type: "set"; settings: BuilderSettings } | { type: "undo" } | { type: "redo" };
function historyReducer(state: History, action: Action): History {
  if (action.type === "undo") {
    const previous = state.past.at(-1);
    return previous
      ? {
          past: state.past.slice(0, -1),
          present: previous,
          future: [state.present, ...state.future],
        }
      : state;
  }
  if (action.type === "redo") {
    const next = state.future[0];
    return next
      ? { past: [...state.past, state.present], present: next, future: state.future.slice(1) }
      : state;
  }
  if (JSON.stringify(state.present) === JSON.stringify(action.settings)) return state;
  return { past: [...state.past, state.present].slice(-100), present: action.settings, future: [] };
}
const previews = ["components", "dashboard", "mail", "chat", "finances"] as const;
type Preview = (typeof previews)[number];
const proPaths = {
  dashboard: "dashboard",
  mail: "email",
  chat: "chat",
  finances: "finances",
} as const;

function subscribePreviewViewport(onChange: () => void) {
  const media = window.matchMedia("(min-width: 1024px)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function subscribeDocumentTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
function readDocumentTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
const subscribeHydration = () => () => {};

function ProPreview({
  tab,
  settings,
  mode,
}: {
  tab: Exclude<Preview, "components">;
  settings: BuilderSettings;
  mode: "light" | "dark";
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const origin = useSyncExternalStore<string | null>(
    subscribeHydration,
    () => window.location.origin,
    () => null,
  );
  useEffect(() => {
    const send = () => {
      const target = frame.current?.contentWindow;
      target?.postMessage({ type: "heroui-theme", theme: mode }, "https://heroui.pro");
      target?.postMessage(
        { type: "heroui-accent", vars: builderVariables(settings, mode) },
        "https://heroui.pro",
      );
      const font = getBuilderFont(settings.fontFamily);
      target?.postMessage(
        { type: "heroui-font", family: font.label, variable: font.variable, cdnUrl: font.cdnUrl },
        "https://heroui.pro",
      );
    };
    const iframe = frame.current;
    const receive = (event: MessageEvent) => {
      if (
        event.origin === "https://heroui.pro" &&
        event.source === iframe?.contentWindow &&
        event.data?.type === "heroui-ready"
      )
        send();
    };
    iframe?.addEventListener("load", send);
    window.addEventListener("message", receive);
    send();
    return () => {
      iframe?.removeEventListener("load", send);
      window.removeEventListener("message", receive);
    };
  }, [settings, mode, tab, origin]);
  if (origin === null) return <output>Loading online preview…</output>;
  if (origin === "https://heroui.pro") {
    return <a href={`https://heroui.pro/templates/${proPaths[tab]}`}>Open HeroUI Pro preview</a>;
  }
  return (
    <iframe
      ref={frame}
      src={`https://heroui.pro/templates/${proPaths[tab]}`}
      title={`HeroUI Pro ${tab} online preview`}
      // The fixed cross-origin frame cannot access frameElement/parent DOM.
      // Its real origin is required for the checked postMessage protocol above.
      sandbox="allow-scripts allow-same-origin"
      referrerPolicy="no-referrer"
      {...stylex.props(s.iframe)}
    />
  );
}

function useBuilderHistory() {
  const [history, dispatch] = useReducer(historyReducer, {
    past: [],
    present: defaultThemeVariables,
    future: [],
  });
  const [status, setStatus] = useState("");
  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get("theme");
    if (!encoded) return;
    try {
      dispatch({ type: "set", settings: validateBuilderSettings(JSON.parse(encoded)) });
    } catch {
      // oxlint-disable-next-line react/set-state-in-effect -- Report invalid external URL state after hydration.
      setStatus("The shared theme is invalid; the default theme is shown.");
    }
  }, []);
  return { history, dispatch, status, setStatus };
}

export function ThemeBuilder({ locale }: { locale: "en" | "cn" }) {
  const { history, dispatch, status, setStatus } = useBuilderHistory();
  const settings = history.present;
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
  const desktopPreview = useSyncExternalStore(
    subscribePreviewViewport,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
  const previewTab = desktopPreview ? tab : "components";
  const [codeOpen, setCodeOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [locks, setLocks] = useState<ReadonlySet<AppearanceKey>>(new Set());
  const update = (changes: Partial<BuilderSettings>) =>
    dispatch({ type: "set", settings: validateBuilderSettings({ ...settings, ...changes }) });

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
          "input,textarea,select,[contenteditable],[role=slider],[role=listbox],[role=dialog]",
        )
      )
        return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        dispatch({ type: event.key === "ArrowLeft" ? "undo" : "redo" });
      }
    };
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [dispatch]);

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
      dispatch({ type: "set", settings: validateBuilderSettings(JSON.parse(await file.text())) });
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
      xstyle={s.page}
    >
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
                disabled={!history.past.length}
                onClick={() => dispatch({ type: "undo" })}
                xstyle={s.icon}
              >
                <ArrowUturnCcwLeft width={16} height={16} />
              </Button>
              <Button
                variant="tertiary"
                aria-label="Redo"
                title="Redo"
                disabled={!history.future.length}
                onClick={() => dispatch({ type: "redo" })}
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
              onClick={() => dispatch({ type: "set", settings: defaultThemeVariables })}
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
        <Tabs value={tab} onValueChange={(value) => setTab(value as Preview)} xstyle={s.desktop}>
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
        </Tabs>
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
              const url = new URL(window.location.pathname, window.location.origin);
              url.searchParams.set("theme", JSON.stringify(settings));
              try {
                await navigator.clipboard.writeText(url.href);
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
        <div {...stylex.props(s.attribution, previewTab === "components" && s.invisible)}>
          <a
            href={`https://heroui.pro/templates/${tab === "components" ? "dashboard" : proPaths[tab]}`}
            target="_blank"
            rel="noopener noreferrer"
            {...stylex.props(s.muted)}
          >
            HeroUI Pro online preview · available as a Pro template
          </a>
        </div>
        <div {...stylex.props(s.frame)}>
          {previewTab === "components" ? (
            <div {...stylex.props(s.preview)}>
              <ThemeBuilderPreview />
            </div>
          ) : (
            <ProPreview tab={previewTab} settings={settings} mode={mode} />
          )}
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
    </ThemeScope>
  );
}
