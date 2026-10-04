// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 alert-dialog-custom-animations (Apache-2.0).
import { ArrowUpFromLine, Sparkles } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { AlertDialog, Button } from "@lenso/ui";
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
    maxWidth: 400,
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
        "基于物理感的弹性缩放，模拟高阻尼弹簧：瞬态响应快、回落时间长，适合警告框与模态框。",
    },
    {
      name: "Fluid Slide",
      Icon: ArrowUpFromLine,
      popup: styles.slide,
      backdrop: styles.slideBackdrop,
      description:
        "模拟在介质中运动并受流体阻力影响，避免机械式线性，更自然、更贴地，适合底部抽屉或 Toast。",
    },
  ];
  return (
    <div {...stylex.props(styles.row)}>
      {animations.map(({ name, Icon, popup, backdrop, description }) => (
        <AlertDialog key={name}>
          <AlertDialog.Trigger render={<Button variant="secondary" />}>{name}</AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Backdrop xstyle={backdrop} />
            <AlertDialog.Viewport>
              <AlertDialog.Popup xstyle={[styles.popup, popup]}>
                <AlertDialog.Close aria-label="Close dialog" />
                <AlertDialog.Header>
                  <AlertDialog.Icon variant="accent">
                    <Icon {...stylex.props(styles.glyph)} />
                  </AlertDialog.Icon>
                  <AlertDialog.Title>{name}动画</AlertDialog.Title>
                </AlertDialog.Header>
                <AlertDialog.Body>
                  <AlertDialog.Description xstyle={styles.description}>
                    {description}
                  </AlertDialog.Description>
                </AlertDialog.Body>
                <AlertDialog.Footer>
                  <AlertDialog.Close render={<Button variant="tertiary" />}>关闭</AlertDialog.Close>
                  <AlertDialog.Close render={<Button />}>再试一次</AlertDialog.Close>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        </AlertDialog>
      ))}
    </div>
  );
}
