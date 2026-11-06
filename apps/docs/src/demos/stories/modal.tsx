"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface ModalStoryProps extends Pick<StoryComponentProps<typeof Modal>, "defaultOpen"> {}
export const initialArgs: ModalStoryProps = /* story-args:start */ {
  defaultOpen: false,
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 modal-default (Apache-2.0).
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const styles = stylex.create({
  popup: { maxWidth: 360 },
  icon: { backgroundColor: "var(--lenso-control-fill)", color: "var(--lenso-label-primary)" },
  rocket: { width: 20, height: 20 },
  continue: { width: "100%" },
});

export function Default(overrides: ModalStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Modal {...args}>
      <Modal.Trigger render={<Button />}>Open Modal</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup xstyle={styles.popup}>
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header>
              <Modal.Icon xstyle={styles.icon}>
                <Rocket {...stylex.props(styles.rocket)} />
              </Modal.Icon>
              <Modal.Title>Welcome to Lenso UI</Modal.Title>
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
