"use client";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16 },
  popup: { maxWidth: 400 },
  accent: {
    backgroundColor: "var(--lenso-control-tint-subtle-fill)",
    color: "var(--lenso-tint-text)",
  },
  success: {
    backgroundColor: "var(--lenso-control-status-success-soft-fill)",
    color: "var(--lenso-status-success-text)",
  },
  warning: {
    backgroundColor: "var(--lenso-control-status-warning-soft-fill)",
    color: "var(--lenso-status-warning-text)",
  },
  danger: {
    backgroundColor: "var(--lenso-control-status-error-soft-fill)",
    color: "var(--lenso-status-error-text)",
  },
});

export function Statuses() {
  const examples = [
    {
      status: "accent",
      trigger: "Sign Out",
      header: "Sign out of your account?",
      body: "You'll need to sign in again to access your account. Any unsaved changes will be lost.",
      cancel: "Stay Signed In",
      confirm: "Sign Out",
    },
    {
      status: "success",
      trigger: "Complete Task",
      header: "Complete this task?",
      body: "This will mark the task as complete and notify all team members. The task will be moved to your completed list.",
      cancel: "Not Yet",
      confirm: "Mark Complete",
    },
    {
      status: "warning",
      trigger: "Discard Changes",
      header: "Discard unsaved changes?",
      body: "You have unsaved changes that will be permanently lost. Are you sure you want to discard them?",
      cancel: "Keep Editing",
      confirm: "Discard",
    },
    {
      status: "danger",
      trigger: "Delete Account",
      header: "Delete your account?",
      body: "This will permanently delete your account and remove all your data from our servers. This action is irreversible.",
      cancel: "Cancel",
      confirm: "Delete Account",
    },
  ] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {examples.map(({ status, trigger, header, body, cancel, confirm }) => (
        <AlertDialog key={status}>
          <AlertDialog.Trigger render={<Button xstyle={styles[status]} />}>
            {trigger}
          </AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content xstyle={styles.popup}>
            <AlertDialog.Close aria-label="Close dialog" />
            <AlertDialog.Header>
              <AlertDialog.Icon variant={status} />
              <AlertDialog.Title>{header}</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>{body}</AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Action variant="cancel">{cancel}</AlertDialog.Action>
              <AlertDialog.Action variant={status === "danger" ? "destructive" : "default"}>
                {confirm}
              </AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      ))}
    </div>
  );
}
