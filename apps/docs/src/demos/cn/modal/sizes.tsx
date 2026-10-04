// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 modal-sizes (Apache-2.0).
import { Rocket } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { Button, Modal } from "@lenso/ui";
const SIZE_LABELS = {
  cover: "通栏",
  full: "全屏",
  lg: "大",
  md: "中",
  sm: "小",
  xs: "超小",
};
const styles = stylex.create({
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 16,
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
export function Sizes() {
  const sizes = ["xs", "sm", "md", "lg", "cover", "full"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {sizes.map((size) => (
        <Modal key={size}>
          <Modal.Trigger render={<Button variant="secondary" />}>
            {size.charAt(0).toUpperCase() + size.slice(1)}
          </Modal.Trigger>
          <Modal.Portal>
            <Modal.Backdrop />
            <Modal.Viewport>
              <Modal.Popup size={size}>
                <Modal.Close aria-label="Close dialog" />
                <Modal.Header>
                  <Modal.Icon xstyle={styles.icon}>
                    <Rocket {...stylex.props(styles.rocket)} />
                  </Modal.Icon>
                  <Modal.Title>Size: {size.charAt(0).toUpperCase() + size.slice(1)}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Modal.Description>
                    {size === "cover" ? (
                      <>
                        此模态框使用<code>通栏</code>尺寸：在移动端与桌面端保留边距（移动端约
                        16px、桌面端约
                        40px）铺满可视区域，仍保持圆角与标准内边距，适合需要最大宽度又保留模态框气质的内容展示。
                      </>
                    ) : size === "full" ? (
                      <>
                        此模态框使用<code>全屏</code> size variant. It occupies the entire viewport
                        without any margins, rounded corners, or shadows, creating a true fullscreen
                        experience. Ideal for immersive content or full-page interactions.
                      </>
                    ) : (
                      <>
                        此模态框使用<code>{SIZE_LABELS[size]}</code> size variant. On mobile
                        devices, all sizes adapt to near full-width for optimal viewing. On desktop,
                        each size provides a different maximum width to suit various content needs.
                      </>
                    )}
                  </Modal.Description>
                </Modal.Body>
                <Modal.Footer>
                  <Modal.Close render={<Button variant="secondary" />}>取消</Modal.Close>
                  <Modal.Close render={<Button />}>确认</Modal.Close>
                </Modal.Footer>
              </Modal.Popup>
            </Modal.Viewport>
          </Modal.Portal>
        </Modal>
      ))}
    </div>
  );
}
