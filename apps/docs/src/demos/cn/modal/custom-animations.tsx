// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-custom-animations (Apache-2.0).
import { ArrowUpFromLine, Sparkles } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const scaleIn = stylex.keyframes({
  from: {
    opacity: 0,
    transform: "scale(.95)",
  },
  to: {
    opacity: 1,
    transform: "scale(1)",
  },
});
const scaleOut = stylex.keyframes({
  from: {
    opacity: 1,
    transform: "scale(1)",
  },
  to: {
    opacity: 0,
    transform: "scale(.95)",
  },
});
const slideIn = stylex.keyframes({
  from: {
    opacity: 0,
    transform: "translateY(16px)",
  },
  to: {
    opacity: 1,
    transform: "translateY(0)",
  },
});
const slideOut = stylex.keyframes({
  from: {
    opacity: 1,
    transform: "translateY(0)",
  },
  to: {
    opacity: 0,
    transform: "translateY(8px)",
  },
});
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
  glyph: {
    width: 20,
    height: 20,
  },
  description: {
    marginTop: 4,
  },
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
    animationDuration: {
      default: "400ms",
      ":is([data-ending-style])": "200ms",
    },
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
    animationDuration: {
      default: "500ms",
      ":is([data-ending-style])": "200ms",
    },
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
        "基于物理的弹性缩放，模拟高阻尼弹簧系统：快速瞬态响应与较长 settling 时间。适用于模态框与弹出层。",
    },
    {
      name: "Fluid Slide",
      Icon: ArrowUpFromLine,
      popup: styles.slide,
      backdrop: styles.slideBackdrop,
      description:
        "模拟流体阻力中的运动，摆脱机械式线性动画，呈现更自然、沉稳的质感。适用于底部抽屉或 Toast。",
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
                  <Modal.Title>{name}动画</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Modal.Description xstyle={styles.description}>{description}</Modal.Description>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close render={<Button variant="tertiary" />}>关闭</Modal.Close>
                  <Modal.Close render={<Button />}>再试一次</Modal.Close>
                </Modal.Footer>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
      ))}
    </div>
  );
}
