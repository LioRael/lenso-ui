"use client";

import { DialRoot, useDialKit } from "dialkit";

import { Button } from "@lenso/ui/button";
import { Dialog } from "@lenso/ui/dialog";
import { TextField } from "@lenso/ui/text-field";
import { ThemeScope } from "@lenso/ui/theme-scope";

import { LivePlayground } from "../live-playground";

export function DialogPlayground() {
  const values = useDialKit(
    "Dialog",
    {
      description: "Make changes to this item. Changes are saved when you confirm.",
      footer: true,
      theme: { default: "light", options: ["light", "dark"], type: "select" },
      title: "Edit details",
    },
    { id: "docs-dialog" },
  );
  const theme = values.theme as "dark" | "light";

  return (
    <LivePlayground
      controls={<DialRoot mode="inline" productionEnabled theme={theme} />}
      description="Tune the real Dialog instance with DialKit, then open it to verify focus and dismissal behavior."
      preview={
        <ThemeScope className="stage-canvas dialog-stage" theme={theme}>
          <Dialog.Root>
            <Dialog.Trigger render={<Button variant="secondary" />}>Open dialog</Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop />
              <Dialog.Viewport>
                <Dialog.Popup>
                  <Dialog.Header>
                    <Dialog.Title>{values.title}</Dialog.Title>
                    <Dialog.Close />
                  </Dialog.Header>
                  <Dialog.Body>
                    <Dialog.Description>{values.description}</Dialog.Description>
                    <TextField.Root style={{ width: 304 }}>
                      <TextField.Label>Field label</TextField.Label>
                      <TextField.Control placeholder="Enter value" />
                      <TextField.Description>Optional supporting text.</TextField.Description>
                    </TextField.Root>
                  </Dialog.Body>
                  {values.footer && (
                    <Dialog.Footer>
                      <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
                      <Dialog.Close render={<Button />}>Save</Dialog.Close>
                    </Dialog.Footer>
                  )}
                </Dialog.Popup>
              </Dialog.Viewport>
            </Dialog.Portal>
          </Dialog.Root>
          <p>Open the dialog to test its real modal behavior.</p>
        </ThemeScope>
      }
    />
  );
}
