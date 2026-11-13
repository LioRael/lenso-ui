"use client";
import { useState, type ComponentProps } from "react";
import { AlertDialog, Button, TextField } from "@lenso/ui";

export interface AlertDialogStoryProps {
  layout: NonNullable<ComponentProps<typeof AlertDialog.Footer>["layout"]>;
  withFields: boolean;
  destructive: boolean;
}
export const initialArgs: AlertDialogStoryProps = /* story-args:start */ {
  layout: "side-by-side",
  withFields: false,
  destructive: false,
}; /* story-args:end */

export function Default(overrides: AlertDialogStoryProps) {
  const { layout, withFields, destructive } = { ...initialArgs, ...overrides };
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger render={<Button />}>Show alert</AlertDialog.Trigger>
      <AlertDialog.Backdrop />
      <AlertDialog.Content>
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
          <AlertDialog.Fields>
            <TextField.Group aria-label="Project details">
              <TextField>
                <TextField.Input aria-label="Project name" placeholder="Project name" />
              </TextField>
              <TextField>
                <TextField.Input aria-label="Description" placeholder="Description" />
              </TextField>
            </TextField.Group>
          </AlertDialog.Fields>
        )}
        <AlertDialog.Footer layout={layout}>
          <AlertDialog.Close>Cancel</AlertDialog.Close>
          <AlertDialog.Action variant={destructive ? "destructive" : "default"}>
            {destructive ? "Delete" : "Save"}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
