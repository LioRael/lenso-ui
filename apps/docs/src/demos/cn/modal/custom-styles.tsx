// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-custom-styles (Apache-2.0).
import { CircleCheck } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const styles = stylex.create({
  backdrop: {
    backgroundColor: {
      default: "color-mix(in oklab, var(--overlay) 50%, transparent)",
      ':where([data-theme="dark"]) &': "color-mix(in oklab, var(--overlay) 65%, transparent)",
    },
  },
  popup: {
    position: "relative",
    overflow: "hidden",
    maxWidth: 340,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: {
      default: "color-mix(in oklab, var(--border) 80%, transparent)",
      ':where([data-theme="dark"]) &': "color-mix(in oklab, var(--border) 90%, transparent)",
    },
    backgroundColor: {
      default: "color-mix(in oklab, var(--surface) 90%, transparent)",
      ':where([data-theme="dark"]) &': "color-mix(in oklab, var(--surface) 85%, transparent)",
    },
    boxShadow: {
      default: "0 25px 50px -12px rgb(0 0 0 / 25%), 0 0 0 1px rgb(0 0 0 / 5%)",
      ':where([data-theme="dark"]) &':
        "0 25px 50px -12px rgb(0 0 0 / 25%), 0 0 0 1px rgb(255 255 255 / 10%)",
    },
    backdropFilter: "blur(24px)",
  },
  glow: {
    pointerEvents: "none",
    position: "absolute",
    insetInline: 0,
    top: 0,
    height: 80,
    backgroundImage: {
      default: "linear-gradient(to bottom, rgb(115 115 115 / 8%), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to bottom, rgb(163 163 163 / 10%), transparent)",
    },
  },
  line: {
    pointerEvents: "none",
    position: "absolute",
    insetInline: 40,
    top: 0,
    height: 1,
    backgroundImage: {
      default: "linear-gradient(to right, transparent, rgb(163 163 163 / 40%), transparent)",
      ':where([data-theme="dark"]) &':
        "linear-gradient(to right, transparent, rgb(115 115 115 / 35%), transparent)",
    },
  },
  relative: {
    position: "relative",
  },
  icon: {
    backgroundColor: {
      default: "rgb(245 245 245)",
      ':where([data-theme="dark"]) &': "rgb(38 38 38)",
    },
    color: {
      default: "rgb(64 64 64)",
      ':where([data-theme="dark"]) &': "rgb(229 229 229)",
    },
  },
  circle: {
    width: 20,
    height: 20,
  },
  caption: {
    fontSize: 14,
    color: "var(--muted)",
  },
  action: {
    width: "100%",
  },
});
export function CustomStyles() {
  return (
    <Modal>
      <Modal.Trigger render={<Button variant="secondary" />}>打开</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop variant="blur" xstyle={styles.backdrop} />
        <Modal.Viewport>
          <Modal.Popup xstyle={styles.popup}>
            <div aria-hidden="true" {...stylex.props(styles.glow)} />
            <div aria-hidden="true" {...stylex.props(styles.line)} />
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header xstyle={styles.relative}>
              <Modal.Icon xstyle={styles.icon}>
                <CircleCheck {...stylex.props(styles.circle)} />
              </Modal.Icon>
              <Modal.Title>更改已保存</Modal.Title>
            </Modal.Header>
            <Modal.Body xstyle={styles.relative}>
              <Modal.Description xstyle={styles.caption}>
                你的草稿已在各设备间同步。
              </Modal.Description>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button xstyle={styles.action} />}>完成</Modal.Close>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
