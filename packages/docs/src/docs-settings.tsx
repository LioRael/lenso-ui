"use client";

import { lazy, Suspense, useRef, useState } from "react";
import { Gear } from "@gravity-ui/icons";
import { GlassButton } from "@lenso/ui/glass-button";
import { headerControls } from "@lenso/docs/presentation";
import type { DocsSettingsPanelProps } from "./docs-settings-panel";

const loadPanel = () => import("./docs-settings-panel");
const SettingsOverlay = lazy(loadPanel);
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
  // null keeps the overlay out of the initial render; false lets it finish closing.
  const [open, setOpen] = useState<boolean | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  return (
    <>
      <GlassButton
        ref={trigger}
        variant="default"
        isIconOnly
        size="sm"
        xstyle={[headerControls.control, headerControls.icon]}
        aria-label={panel.locale === "cn" ? "设置" : "Settings"}
        aria-haspopup="dialog"
        onPointerEnter={preparePanel}
        onFocus={preparePanel}
        onClick={() => setOpen(true)}
      >
        <Gear width={16} height={16} aria-hidden="true" />
      </GlassButton>
      {open !== null && (
        <Suspense fallback={null}>
          <SettingsOverlay
            {...panel}
            split={presentation === "dialog"}
            open={open}
            onOpenChange={setOpen}
            finalFocus={() => trigger.current}
          />
        </Suspense>
      )}
    </>
  );
}
