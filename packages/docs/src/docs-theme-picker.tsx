"use client";

// Modified: native Lenso parts and shared appearance preferences.
import * as stylex from "@stylexjs/stylex";
import { lazy, Suspense } from "react";
import { BucketPaint } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui/glass-button";
import { Popover } from "@lenso/ui/popover";
import { presetPreview, themes } from "./docs-theme-presets";
import { headerControls } from "@lenso/docs/presentation";
import { docsThemePicker as s } from "@lenso/docs/presentation";
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
      <Popover.Content xstyle={s.popup} side="bottom" sideOffset={8} align="end">
        <Popover.Title xstyle={s.hidden}>{cn ? "选择主题" : "Choose theme"}</Popover.Title>
        <Suspense
          fallback={<output>{cn ? "正在准备外观选项…" : "Preparing appearance options…"}</output>}
        >
          <ThemePanel locale={locale} />
        </Suspense>
      </Popover.Content>
    </Popover.Root>
  );
}
