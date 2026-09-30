"use client";
// Adapted from HeroUI v3.2.6 modal-custom-backdrop (Apache-2.0).
import { Sparkles } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  backdrop: {
    backgroundColor: "transparent",
    backgroundImage: {
      default: "linear-gradient(to top, rgb(0 0 0 / 80%), rgb(0 0 0 / 40%), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to top, rgb(39 39 42 / 80%), rgb(39 39 42 / 40%), transparent)",
    },
  },
  popup: { maxWidth: 360 },
  header: { alignItems: "center", textAlign: "center" },
  icon: { backgroundColor: "var(--accent-soft)", color: "var(--accent-soft-foreground)" },
  sparkles: { width: 20, height: 20 },
  footer: { flexDirection: "column-reverse" },
  action: { width: "100%" },
});

export function CustomBackdrop() {
  return (
    <Modal>
      <Modal.Trigger render={<Button variant="secondary" />}>Custom Backdrop</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop variant="blur" xstyle={styles.backdrop} />
        <Modal.Viewport>
          <Modal.Popup xstyle={styles.popup}>
            <Modal.Header xstyle={styles.header}>
              <Modal.Icon xstyle={styles.icon}>
                <Sparkles {...stylex.props(styles.sparkles)} />
              </Modal.Icon>
              <Modal.Title>Premium Backdrop</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Description>
                This backdrop features a sophisticated gradient that transitions from a dark color
                at the bottom to complete transparency at the top, combined with a smooth blur
                effect. The gradient automatically adapts its intensity for optimal contrast in both
                light and dark modes.
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer xstyle={styles.footer}>
              <Modal.Close render={<Button xstyle={styles.action} />}>Amazing!</Modal.Close>
              <Modal.Close render={<Button variant="secondary" xstyle={styles.action} />}>
                Close
              </Modal.Close>
            </Modal.Footer>
            <Modal.Close aria-label="Close dialog" />
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
