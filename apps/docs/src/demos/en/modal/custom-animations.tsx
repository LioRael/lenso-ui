"use client";
// Adapted from HeroUI v3.2.6 modal-custom-animations (Apache-2.0).
import { ArrowUpFromLine, Sparkles } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";

const scaleIn = stylex.keyframes({
  from: { opacity: 0, transform: "scale(.95)" },
  to: { opacity: 1, transform: "scale(1)" },
});
const scaleOut = stylex.keyframes({
  from: { opacity: 1, transform: "scale(1)" },
  to: { opacity: 0, transform: "scale(.95)" },
});
const slideIn = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(16px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});
const slideOut = stylex.keyframes({
  from: { opacity: 1, transform: "translateY(0)" },
  to: { opacity: 0, transform: "translateY(8px)" },
});
const styles = stylex.create({
  row: { display: "flex", flexWrap: "wrap", gap: 16 },
  popup: { maxWidth: 360 },
  icon: { backgroundColor: "var(--default)", color: "var(--foreground)" },
  glyph: { width: 20, height: 20 },
  description: { marginTop: 4 },
  scaleBackdrop: {
    transitionDuration: {
      default: "400ms",
      ":is([data-ending-style])": "200ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: {
      default: "cubic-bezier(.16,1,.3,1)",
      ":is([data-ending-style])": "cubic-bezier(.7,0,.84,0)",
    },
  },
  slideBackdrop: {
    transitionDuration: {
      default: "500ms",
      ":is([data-ending-style])": "200ms",
      "@media (prefers-reduced-motion: reduce)": "0ms",
    },
    transitionTimingFunction: {
      default: "cubic-bezier(.25,1,.5,1)",
      ":is([data-ending-style])": "cubic-bezier(.5,0,.75,0)",
    },
  },
  scale: {
    animationName: {
      default: scaleIn,
      ":is([data-ending-style])": scaleOut,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    animationDuration: { default: "400ms", ":is([data-ending-style])": "200ms" },
    animationTimingFunction: {
      default: "cubic-bezier(.16,1,.3,1)",
      ":is([data-ending-style])": "cubic-bezier(.7,0,.84,0)",
    },
    transitionProperty: "none",
  },
  slide: {
    animationName: {
      default: slideIn,
      ":is([data-ending-style])": slideOut,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    animationDuration: { default: "500ms", ":is([data-ending-style])": "200ms" },
    animationTimingFunction: {
      default: "cubic-bezier(.25,1,.5,1)",
      ":is([data-ending-style])": "cubic-bezier(.5,0,.75,0)",
    },
    transitionProperty: "none",
  },
});

export function CustomAnimations() {
  const animations = [
    {
      name: "Kinematic Scale",
      Icon: Sparkles,
      popup: styles.scale,
      backdrop: styles.scaleBackdrop,
      description:
        "Physics-based elastic scaling. Simulates a high-damping spring system with fast transient response and prolonged settling time. Ideal for Modals and Popovers.",
    },
    {
      name: "Fluid Slide",
      Icon: ArrowUpFromLine,
      popup: styles.slide,
      backdrop: styles.slideBackdrop,
      description:
        "Simulates movement through a medium with fluid resistance. Eliminates mechanical linearity for a natural, grounded feel. Perfect for Bottom Sheets or Toasts.",
    },
  ];
  return (
    <div {...stylex.props(styles.row)}>
      {animations.map(({ name, Icon, popup, backdrop, description }) => (
        <Modal key={name}>
          <Modal.Trigger render={<Button variant="secondary" />}>{name}</Modal.Trigger>
          <Modal.Portal>
            <Modal.Backdrop xstyle={backdrop} />
            <Modal.Viewport>
              <Modal.Popup xstyle={[styles.popup, popup]}>
                <Modal.Close aria-label="Close dialog" />
                <Modal.Header>
                  <Modal.Icon xstyle={styles.icon}>
                    <Icon {...stylex.props(styles.glyph)} />
                  </Modal.Icon>
                  <Modal.Title>{name} Animation</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Modal.Description xstyle={styles.description}>{description}</Modal.Description>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close render={<Button variant="tertiary" />}>Close</Modal.Close>
                  <Modal.Close render={<Button />}>Try Again</Modal.Close>
                </Modal.Footer>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
      ))}
    </div>
  );
}
