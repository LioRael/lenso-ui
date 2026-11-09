"use client";

// Modified: native Lenso parts and shared appearance preferences.
import * as stylex from "@stylexjs/stylex";
import { lazy, Suspense } from "react";
import { BucketPaint } from "@gravity-ui/icons";
import { GlassButton, Popover } from "@lenso/ui";
import { presetPreview, themes } from "@/lib/docs-theme-presets";
import { headerControls } from "@/styles/header-controls.stylex";
import { docsThemePicker as s } from "@/styles/docs-theme-picker.stylex";
import { useDocsDesignTheme } from "./docs-design-theme-context";

const loadPanel = () => import("./docs-theme-panel");
const ThemePanel = lazy(loadPanel);
function preparePanel() {
  void loadPanel().catch(() => {});
}

export function DocsThemePicker({ locale }: { locale: "en" | "cn" }) {
  const { active } = useDocsDesignTheme();
  const cn = locale === "cn";
  const current = themes.find((theme) => theme.id === active)!;
  const named = active !== "default";
  const avatar = stylex.props(s.avatar);
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <GlassButton
            size="sm"
            variant="default"
            xstyle={[headerControls.control, s.trigger, named && s.namedTrigger]}
          />
        }
        onPointerEnter={preparePanel}
        onFocus={preparePanel}
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
            <Suspense
              fallback={
                <output>{cn ? "正在准备外观选项…" : "Preparing appearance options…"}</output>
              }
            >
              <ThemePanel locale={locale} />
            </Suspense>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
