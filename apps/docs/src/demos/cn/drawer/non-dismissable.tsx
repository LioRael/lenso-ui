"use client";

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
        <Drawer.Trigger render={<Button />}>重要操作</Drawer.Trigger>
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
                  <Drawer.Close render={<Button variant="bordered" />}>取消</Drawer.Close>
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
