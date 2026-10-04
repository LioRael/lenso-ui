// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 drawer-basic (Apache-2.0).
import { Button, Drawer } from "@lenso/ui";
export function Basic() {
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right">
        <Drawer.Trigger render={<Button variant="secondary" />}>打开抽屉</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>抽屉标题</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p>
                    这是一个基于 React Aria Modal 组件构建的抽屉。它会从屏幕边缘滑入，并通过流畅的
                    CSS 过渡呈现动画效果。
                  </p>
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
