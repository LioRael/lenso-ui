"use client";

import { lazy, Suspense, useState } from "react";
import { Gear } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui/glass-button";
import { Modal } from "@lenso/ui/modal";
import { Sheet } from "@lenso/ui/sheet";
import { docsSettings as s, headerControls } from "@lenso/docs/presentation";
import type { DocsSettingsPanelProps } from "./docs-settings-panel";

const loadPanel = () => import("./docs-settings-panel");
const SettingsPanel = lazy(loadPanel);
function preparePanel() {
  void loadPanel().catch(() => {});
}

export interface DocsSettingsProps extends Omit<
  DocsSettingsPanelProps,
  "onLanguageSelect" | "split"
> {
  presentation?: "dialog" | "sheet";
}

/** One entry for appearance, theme and language preferences. */
export function DocsSettings({ presentation = "dialog", ...panel }: DocsSettingsProps) {
  const [open, setOpen] = useState(false);
  const cn = panel.locale === "cn";
  const title = cn ? "设置" : "Settings";
  const trigger = (
    <GlassButton
      variant="default"
      isIconOnly
      size="sm"
      xstyle={[headerControls.control, headerControls.icon]}
    />
  );
  const icon = <Gear width={16} height={16} aria-hidden="true" />;
  const loading = <output>{cn ? "正在准备设置…" : "Preparing settings…"}</output>;
  const body = (
    <Suspense
      fallback={
        presentation === "sheet" ? (
          loading
        ) : (
          <Modal.Header xstyle={s.loading}>
            <Modal.Title>{title}</Modal.Title>
            {loading}
          </Modal.Header>
        )
      }
    >
      <SettingsPanel
        {...panel}
        split={presentation === "dialog"}
        onLanguageSelect={() => setOpen(false)}
      />
    </Suspense>
  );
  if (presentation === "sheet")
    return (
      <Sheet open={open} onOpenChange={setOpen} snapPoints={[0.76, 1]} defaultSnapPoint={0.76}>
        <Sheet.Trigger
          render={trigger}
          aria-label={title}
          onPointerEnter={preparePanel}
          onFocus={preparePanel}
        >
          {icon}
        </Sheet.Trigger>
        <Sheet.Backdrop />
        <Sheet.Content>
          <Sheet.Handle />
          <Sheet.Header>
            <Sheet.Close aria-label={cn ? "关闭设置" : "Close settings"} />
            <Sheet.Title>{title}</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body xstyle={s.sheetBody}>{body}</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <Modal.Trigger
        render={trigger}
        aria-label={title}
        onPointerEnter={preparePanel}
        onFocus={preparePanel}
      >
        {icon}
      </Modal.Trigger>
      <Modal.Backdrop />
      <Modal.Content placement="center" xstyle={s.dialog}>
        <Modal.Close aria-label={cn ? "关闭设置" : "Close settings"} xstyle={s.dialogClose} />
        {body}
      </Modal.Content>
    </Modal>
  );
}
