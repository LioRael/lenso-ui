"use client";

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
      default: "var(--lenso-background-grouped-secondary)",
      ":hover": "var(--lenso-background-secondary)",
    },
    padding: 16,
    boxShadow: "var(--lenso-surface-shadow)",
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
    backgroundColor: "var(--lenso-control-tint-subtle-fill)",
    color: "var(--lenso-tint-text)",
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
    color: "var(--lenso-label-secondary)",
  },
  popup: {
    maxWidth: 360,
  },
  icon: {
    backgroundColor: "var(--lenso-control-tint-subtle-fill)",
    color: "var(--lenso-tint-text)",
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
              <Modal.Close render={<Button variant="bordered" />}>取消</Modal.Close>
              <Modal.Close render={<Button />}>保存</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
