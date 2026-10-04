// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-custom-trigger (Apache-2.0).
import { Gear } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const styles = stylex.create({
  trigger: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: {
      default: "var(--surface)",
      ":hover": "var(--surface-secondary)",
    },
    padding: 16,
    boxShadow: "var(--shadow-xs)",
    userSelect: "none",
  },
  gearBox: {
    display: "flex",
    width: 48,
    height: 48,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "var(--accent-soft)",
    color: "var(--accent-soft-foreground)",
  },
  copy: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    gap: 2,
    textAlign: "start",
  },
  heading: {
    fontSize: 14,
    fontWeight: 600,
  },
  caption: {
    fontSize: 12,
    color: "var(--muted)",
  },
  popup: {
    maxWidth: 360,
  },
  icon: {
    backgroundColor: "var(--accent-soft)",
    color: "var(--accent-soft-foreground)",
  },
  largeGear: {
    width: 24,
    height: 24,
  },
  gear: {
    width: 20,
    height: 20,
  },
});
export function CustomTrigger() {
  return (
    <Modal>
      <Modal.Trigger xstyle={styles.trigger}>
        <div {...stylex.props(styles.gearBox)}>
          <Gear {...stylex.props(styles.largeGear)} />
        </div>
        <div {...stylex.props(styles.copy)}>
          <p {...stylex.props(styles.heading)}>设置</p>
          <p {...stylex.props(styles.caption)}>管理你的偏好设置</p>
        </div>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup xstyle={styles.popup}>
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header>
              <Modal.Icon xstyle={styles.icon}>
                <Gear {...stylex.props(styles.gear)} />
              </Modal.Icon>
              <Modal.Title>设置</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Modal.Description>
                Use <code>Modal.Trigger</code> to create custom trigger elements beyond standard
                buttons. This example shows a card-style trigger with icons and descriptive text.
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button variant="secondary" />}>取消</Modal.Close>
              <Modal.Close render={<Button />}>保存</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
