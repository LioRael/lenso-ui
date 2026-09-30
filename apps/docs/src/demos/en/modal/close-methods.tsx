"use client";
// Adapted from HeroUI v3.2.6 modal-close-methods (Apache-2.0).
import { CircleCheck, CircleInfo } from "@gravity-ui/icons";
import { useRef } from "react";
import { Dialog } from "@base-ui/react/dialog";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  column: { display: "flex", maxWidth: 672, flexDirection: "column", gap: 32 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  heading: { fontSize: 18, fontWeight: 600 },
  caption: { fontSize: 14, color: "var(--muted)" },
  popup: { maxWidth: 360 },
  accent: { backgroundColor: "var(--accent-soft)", color: "var(--accent-soft-foreground)" },
  success: { backgroundColor: "var(--success-soft)", color: "var(--success-soft-foreground)" },
  circle: { width: 20, height: 20 },
});

export function CloseMethods() {
  const actionsRef = useRef<Dialog.Root.Actions | null>(null);
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using Modal.Close</h3>
        <p {...stylex.props(styles.caption)}>
          Compose a Button with <code>Modal.Close</code> to close the modal automatically.
        </p>
        <Modal>
          <Modal.Trigger render={<Button variant="secondary" />}>Open Modal</Modal.Trigger>
          <Modal.Portal>
            <Modal.Backdrop />
            <Modal.Viewport>
              <Modal.Popup xstyle={styles.popup}>
                <Modal.Header>
                  <Modal.Icon xstyle={styles.accent}>
                    <CircleInfo {...stylex.props(styles.circle)} />
                  </Modal.Icon>
                  <Modal.Title>Using Modal.Close</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Modal.Description>
                    Click either button below - both use <code>Modal.Close</code> and will close the
                    modal automatically.
                  </Modal.Description>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close render={<Button variant="secondary" />}>Cancel</Modal.Close>
                  <Modal.Close render={<Button />}>Confirm</Modal.Close>
                </Modal.Footer>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
      </div>
      <div {...stylex.props(styles.section)}>
        <h3 {...stylex.props(styles.heading)}>Using Root actions</h3>
        <p {...stylex.props(styles.caption)}>
          Access the native <code>close</code> method through the Root&apos;s{" "}
          <code>actionsRef</code>. This gives you full control over when and how to close the modal,
          allowing you to add custom logic before closing.
        </p>
        <Modal actionsRef={actionsRef}>
          <Modal.Trigger render={<Button variant="secondary" />}>Open Modal</Modal.Trigger>
          <Modal.Portal>
            <Modal.Backdrop />
            <Modal.Viewport>
              <Modal.Popup xstyle={styles.popup}>
                <Modal.Header>
                  <Modal.Icon xstyle={styles.success}>
                    <CircleCheck {...stylex.props(styles.circle)} />
                  </Modal.Icon>
                  <Modal.Title>Using Root actions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Modal.Description>
                    The buttons below use the <code>close</code> method from Root actions. You can
                    add validation or other logic before calling{" "}
                    <code>actionsRef.current.close()</code>.
                  </Modal.Description>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => actionsRef.current?.close()}>
                    Cancel
                  </Button>
                  <Button onClick={() => actionsRef.current?.close()}>Confirm</Button>
                </Modal.Footer>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
      </div>
    </div>
  );
}
