"use client";
import { useState } from "react";
import { createAlertDialogController } from "@ui-sdk/react/alert-dialog";
import * as stylex from "@stylexjs/stylex";
import { GlassButton, AlertDialog, Button } from "@lenso/ui";

const styles = stylex.create({
  column: { display: "flex", maxWidth: 672, flexDirection: "column", gap: 32 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  heading: { fontSize: 18, fontWeight: 600 },
  caption: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  popup: { maxWidth: 400 },
});

export function CloseMethods() {
  const [controller] = useState(createAlertDialogController);
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using AlertDialog.Close</h3>
        <p {...stylex.props(styles.caption)}>
          Compose a Button with <code>AlertDialog.Close</code>to close the dialog automatically.
        </p>
        <AlertDialog>
          <AlertDialog.Trigger render={<Button />}>Open Dialog</AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content xstyle={styles.popup}>
            <AlertDialog.Header>
              <AlertDialog.Icon variant="accent" />
              <AlertDialog.Title>Using AlertDialog.Close</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                Click either button below - both use <code>AlertDialog.Close</code>and will close
                the dialog automatically.
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <AlertDialog.Action variant="cancel">Cancel</AlertDialog.Action>
              <AlertDialog.Action>Confirm</AlertDialog.Action>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </div>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using controller</h3>
        <p {...stylex.props(styles.caption)}>
          Access the native <code>close</code>method through the Root&apos;s <code>controller</code>
          . This gives you full control over when and how to close the dialog, allowing you to add
          custom logic before closing.
        </p>
        <AlertDialog controller={controller}>
          <AlertDialog.Trigger render={<Button />}>Open Dialog</AlertDialog.Trigger>
          <AlertDialog.Backdrop />
          <AlertDialog.Content xstyle={styles.popup}>
            <AlertDialog.Header>
              <AlertDialog.Icon variant="success" />
              <AlertDialog.Title>Using controller</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <AlertDialog.Description>
                The buttons below use the <code>close</code>method from controller. You can add
                validation or other logic before calling <code>controller.close()</code>.
              </AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <GlassButton variant="default" onClick={() => controller.close()}>
                Cancel
              </GlassButton>
              <Button onClick={() => controller.close()}>Confirm</Button>
            </AlertDialog.Footer>
          </AlertDialog.Content>
        </AlertDialog>
      </div>
    </div>
  );
}
