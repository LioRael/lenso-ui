"use client";
import { AlertDialog, Button } from "@lenso/ui";
export function Default() {
  return (
    <AlertDialog>
      <AlertDialog.Trigger render={<Button destructive />}>Delete project</AlertDialog.Trigger>
      <AlertDialog.Backdrop />
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete this project?</AlertDialog.Title>
          <AlertDialog.Description>
            This project and its files will be permanently deleted.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Close>Cancel</AlertDialog.Close>
          <AlertDialog.Action variant="destructive">Delete</AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
}
