"use client";
// Adapted from HeroUI v3.2.6 modal-dismiss-behavior (Apache-2.0).
import { CircleInfo } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  column: { display: "flex", maxWidth: 384, flexDirection: "column", gap: 24 },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  heading: { fontSize: 18, fontWeight: 600 },
  caption: { fontSize: 14, lineHeight: "20px", color: "var(--muted)" },
  popup: { maxWidth: 360 },
  icon: { backgroundColor: "var(--default)", color: "var(--foreground)" },
  circle: { width: 20, height: 20 },
  action: { width: "100%" },
});

export function DismissBehavior() {
  return (
    <div {...stylex.props(styles.column)}>
      {(["outside-press", "escape-key"] as const).map((blockedReason) => (
        <div key={blockedReason} {...stylex.props(styles.section)}>
          <h3 {...stylex.props(styles.heading)}>
            {blockedReason === "outside-press" ? "Backdrop dismissal" : "Keyboard dismissal"}
          </h3>
          <p {...stylex.props(styles.caption)}>
            {blockedReason === "outside-press"
              ? "This modal requires an explicit close action or ESC instead of a backdrop click."
              : "ESC is disabled. Use an explicit close action or click the backdrop."}
          </p>
          <Modal
            onOpenChange={(open, details) => {
              if (!open && details.reason === blockedReason) details.cancel();
            }}
          >
            <Modal.Trigger render={<Button variant="secondary" />}>Open Modal</Modal.Trigger>
            <Modal.Portal>
              <Modal.Backdrop />
              <Modal.Viewport>
                <Modal.Popup xstyle={styles.popup}>
                  <Modal.Close aria-label="Close dialog" />
                  <Modal.Header>
                    <Modal.Icon xstyle={styles.icon}>
                      <CircleInfo {...stylex.props(styles.circle)} />
                    </Modal.Icon>
                    <Modal.Title>
                      {blockedReason === "outside-press"
                        ? "Backdrop dismissal disabled"
                        : "Keyboard dismissal disabled"}
                    </Modal.Title>
                    <Modal.Description xstyle={styles.caption}>
                      {blockedReason === "outside-press"
                        ? "Clicking the backdrop won't close this modal"
                        : "ESC key is disabled"}
                    </Modal.Description>
                  </Modal.Header>
                  <Modal.Body>
                    <p>
                      {blockedReason === "outside-press"
                        ? "Try clicking outside this modal on the overlay - it won't close. You must use the close button or press ESC to dismiss it."
                        : "Press ESC - nothing happens. You must use the close button or click the overlay backdrop to dismiss this modal."}
                    </p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Modal.Close render={<Button xstyle={styles.action} />}>Close</Modal.Close>
                  </Modal.Footer>
                </Modal.Popup>
              </Modal.Viewport>
            </Modal.Portal>
          </Modal>
        </div>
      ))}
    </div>
  );
}
