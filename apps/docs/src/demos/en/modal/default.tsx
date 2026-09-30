"use client";

// Adapted from HeroUI v3.2.6 modal-default (Apache-2.0).
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  popup: { maxWidth: 360 },
  icon: { backgroundColor: "var(--default)", color: "var(--foreground)" },
  rocket: { width: 20, height: 20 },
  continue: { width: "100%" },
});

export function Default() {
  return (
    <Modal>
      <Modal.Trigger render={<Button variant="secondary" />}>Open Modal</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup xstyle={styles.popup}>
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header>
              <Modal.Icon xstyle={styles.icon}>
                <Rocket {...stylex.props(styles.rocket)} />
              </Modal.Icon>
              <Modal.Title>Welcome to HeroUI</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Description>
                A beautiful, fast, and modern React UI library for building accessible and
                customizable web applications with ease.
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button xstyle={styles.continue} />}>Continue</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
