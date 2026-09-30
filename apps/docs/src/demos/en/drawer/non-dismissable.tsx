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
        <Drawer.Trigger render={<Button variant="secondary" />}>Important Action</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Confirm Action</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p>
                    This drawer cannot be dismissed by clicking outside or dragging. You must use
                    one of the buttons below.
                  </p>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>Cancel</Drawer.Close>
                  <Drawer.Close render={<Button />}>Confirm</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
