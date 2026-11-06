"use client";
import { useState } from "react";
import { AlertDialog, Button, TextField, Input } from "@lenso/ui";

export interface AlertDialogStoryProps {
  withFields: boolean;
  destructive: boolean;
}
export const initialArgs: AlertDialogStoryProps = /* story-args:start */ {
  withFields: false,
  destructive: false,
}; /* story-args:end */

export function Default(overrides: AlertDialogStoryProps) {
  const { withFields, destructive } = { ...initialArgs, ...overrides };
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger render={<Button />}>Show alert</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop forceRender />
        <AlertDialog.Viewport>
          <AlertDialog.Popup>
            <AlertDialog.Header>
              <AlertDialog.Title>
                {destructive ? "Delete this project?" : "Save your changes?"}
              </AlertDialog.Title>
              <AlertDialog.Description>
                {destructive
                  ? "This project and its files will be permanently deleted."
                  : "Your changes will be available the next time you open this project."}
              </AlertDialog.Description>
            </AlertDialog.Header>
            {withFields && (
              <AlertDialog.Body>
                <fieldset aria-label="Project details">
                  <TextField>
                    <Input aria-label="Project name" placeholder="Project name" />
                  </TextField>
                  <TextField>
                    <Input aria-label="Description" placeholder="Description" />
                  </TextField>
                </fieldset>
              </AlertDialog.Body>
            )}
            <AlertDialog.Footer>
              <AlertDialog.Close>Cancel</AlertDialog.Close>
              <AlertDialog.Close render={<Button variant={destructive ? "danger" : "primary"} />}>
                {destructive ? "Delete" : "Save"}
              </AlertDialog.Close>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
