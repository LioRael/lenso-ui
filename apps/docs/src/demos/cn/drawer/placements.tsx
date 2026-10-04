// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 drawer-placements (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
const PLACEMENT_LABELS = {
  bottom: "底部",
  left: "左侧",
  right: "右侧",
  top: "顶部",
};
export function Placements() {
  const placements = ["bottom", "top", "left", "right"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {placements.map((placement) => (
        <Drawer.Provider key={placement}>
          <Drawer
            swipeDirection={
              placement === "bottom" ? "down" : placement === "top" ? "up" : placement
            }
          >
            <Drawer.Trigger render={<Button variant="secondary" />}>
              {placement.charAt(0).toUpperCase() + placement.slice(1)}
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Backdrop />
              <Drawer.Viewport>
                <Drawer.Popup>
                  <Drawer.Content>
                    <Drawer.Close
                      aria-label="Close drawer"
                      render={
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          xstyle={styles.cornerClose}
                        />
                      }
                    >
                      <CloseIcon />
                    </Drawer.Close>
                    {placement === "bottom" && <Drawer.Handle />}
                    <Drawer.Header>
                      <Drawer.Title>
                        {placement.charAt(0).toUpperCase() + placement.slice(1)} Drawer
                      </Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <p>
                        此抽屉从屏幕<strong>{PLACEMENT_LABELS[placement]}</strong>边缘滑入。
                      </p>
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Drawer.Close render={<Button variant="secondary" />}>取消</Drawer.Close>
                      <Drawer.Close render={<Button />}>完成</Drawer.Close>
                    </Drawer.Footer>
                    {placement === "top" && <Drawer.Handle />}
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer>
        </Drawer.Provider>
      ))}
    </div>
  );
}
