// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-backdrop-variants (Apache-2.0).
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const VARIANT_LABELS = {
  blur: "模糊",
  opaque: "不透明",
  transparent: "透明",
};
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
  },
  popup: {
    maxWidth: 360,
  },
  icon: {
    backgroundColor: "var(--default)",
    color: "var(--foreground)",
  },
  rocket: {
    width: 20,
    height: 20,
  },
  action: {
    width: "100%",
  },
});
export function BackdropVariants() {
  const variants = ["opaque", "blur", "transparent"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {variants.map((variant) => (
        <Modal key={variant}>
          <Modal.Trigger render={<Button variant="secondary" />}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Modal.Trigger>
          <Modal.Portal>
            <Modal.Backdrop variant={variant} />
            <Modal.Viewport>
              <Modal.Popup xstyle={styles.popup}>
                <Modal.Close aria-label="Close dialog" />
                <Modal.Header>
                  <Modal.Icon xstyle={styles.icon}>
                    <Rocket {...stylex.props(styles.rocket)} />
                  </Modal.Icon>
                  <Modal.Title>
                    Backdrop: {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Modal.Description>
                    This modal uses the <code>{VARIANT_LABELS[variant]}</code> backdrop variant.
                    Compare the different visual effects: opaque provides full opacity, blur adds a
                    backdrop filter, and transparent removes the background.
                  </Modal.Description>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close render={<Button xstyle={styles.action} />}>继续</Modal.Close>
                </Modal.Footer>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
      ))}
    </div>
  );
}
