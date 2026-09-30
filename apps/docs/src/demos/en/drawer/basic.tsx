"use client";

// Adapted from HeroUI v3.2.6 drawer-basic (Apache-2.0).
import { Button, Drawer } from "@lenso/ui";

export function Basic() {
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right">
        <Drawer.Trigger render={<Button variant="secondary" />}>Open Drawer</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Drawer Title</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p>
                    This is a bottom drawer built with React Aria's Modal component. It slides up
                    from the bottom of the screen with a smooth CSS transition.
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
