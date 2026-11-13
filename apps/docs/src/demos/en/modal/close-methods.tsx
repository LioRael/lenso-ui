"use client";
import { CircleCheck, CircleInfo } from "@gravity-ui/icons";
import { useState } from "react";
import { createDialogController } from "@ui-sdk/react/dialog";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  column: { display: "flex", maxWidth: 672, flexDirection: "column", gap: 32 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  heading: { fontSize: 18, fontWeight: 600 },
  caption: { fontSize: 14, color: "var(--lenso-label-secondary)" },
  popup: { maxWidth: 360 },
  accent: {
    backgroundColor: "var(--lenso-control-tint-subtle-fill)",
    color: "var(--lenso-tint-text)",
  },
  success: {
    backgroundColor: "var(--lenso-control-status-success-soft-fill)",
    color: "var(--lenso-status-success-text)",
  },
  circle: { width: 20, height: 20 },
});

export function CloseMethods() {
  const [controller] = useState(createDialogController);
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using Modal.Close</h3>
        <p {...stylex.props(styles.caption)}>
          Compose a Button with <code>Modal.Close</code>to close the modal automatically.
        </p>
        <Modal>
          <Modal.Trigger render={<Button />}>Open Modal</Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content xstyle={styles.popup}>
            <Modal.Header>
              <Modal.Icon xstyle={styles.accent}>
                <CircleInfo {...stylex.props(styles.circle)} />
              </Modal.Icon>
              <Modal.Title>Using Modal.Close</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Description>
                Click either button below - both use <code>Modal.Close</code>and will close the
                modal automatically.
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button variant="bordered" />}>Cancel</Modal.Close>
              <Modal.Close render={<Button />}>Confirm</Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using controller</h3>
        <p {...stylex.props(styles.caption)}>
          Access the native <code>close</code>method through the Root&apos;s <code>controller</code>
          . This gives you full control over when and how to close the modal, allowing you to add
          custom logic before closing.
        </p>
        <Modal controller={controller}>
          <Modal.Trigger render={<Button />}>Open Modal</Modal.Trigger>
          <Modal.Backdrop />
          <Modal.Content xstyle={styles.popup}>
            <Modal.Header>
              <Modal.Icon xstyle={styles.success}>
                <CircleCheck {...stylex.props(styles.circle)} />
              </Modal.Icon>
              <Modal.Title>Using controller</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Description>
                The buttons below use the <code>close</code>method from controller. You can add
                validation or other logic before calling <code>controller.close()</code>.
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="bordered" onClick={() => controller.close()}>
                Cancel
              </Button>
              <Button onClick={() => controller.close()}>Confirm</Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </div>
    </div>
  );
}
