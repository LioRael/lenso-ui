import { Button } from "@lenso/ui/button";
import { Dialog } from "@lenso/ui/dialog";
import { TextField } from "@lenso/ui/text-field";
import { ThemeScope } from "@lenso/ui/theme-scope";

import type { PlaygroundAdapter } from "../types";

export const dialogAdapter: PlaygroundAdapter = ({ theme, values }) => {
  const title = typeof values.title === "string" ? values.title : "Edit details";
  const description =
    typeof values.description === "string"
      ? values.description
      : "Make changes to this item. Changes are saved when you confirm.";
  const hasFooter = values.footer === true;

  return (
    <ThemeScope className="stage-canvas dialog-stage" theme={theme}>
      <Dialog.Root>
        <Dialog.Trigger render={<Button variant="secondary" />}>Open dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup>
              <Dialog.Header>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Close />
              </Dialog.Header>
              <Dialog.Body>
                <Dialog.Description>{description}</Dialog.Description>
                <TextField.Root style={{ width: 304 }}>
                  <TextField.Label>Field label</TextField.Label>
                  <TextField.Control placeholder="Enter value" />
                  <TextField.Description>Optional supporting text.</TextField.Description>
                </TextField.Root>
              </Dialog.Body>
              {hasFooter && (
                <Dialog.Footer>
                  <Dialog.Close render={<Button variant="secondary" />}>Cancel</Dialog.Close>
                  <Dialog.Close render={<Button />}>Save</Dialog.Close>
                </Dialog.Footer>
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </ThemeScope>
  );
};
