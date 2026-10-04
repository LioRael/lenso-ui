// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 drawer-non-dismissable (Apache-2.0).
import { Button, Drawer } from "@lenso/ui";
export function NonDismissable() {
  return (
    <Drawer.Provider>
      <Drawer
        swipeDirection="down"
        onOpenChange={(_open, details) => {
          if (details.reason === "outside-press" || details.reason === "swipe") details.cancel();
        }}
      >
        <Drawer.Trigger render={<Button variant="secondary" />}>重要操作</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>确认操作</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p>此抽屉无法通过点击外部或拖拽关闭。你必须使用下方按钮之一来完成操作。</p>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>取消</Drawer.Close>
                  <Drawer.Close render={<Button />}>确认</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
