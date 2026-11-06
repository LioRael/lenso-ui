"use client";
import type { ComponentProps as StoryComponentProps } from "react";
export interface DrawerStoryProps extends Pick<StoryComponentProps<typeof Drawer>, "defaultOpen"> {}
export const initialArgs: DrawerStoryProps = /* story-args:start */ {
  defaultOpen: false,
}; /* story-args:end */

// Adapted from HeroUI v3.2.6 drawer-basic (Apache-2.0).
import { Button, Drawer } from "@lenso/ui";

export function Basic(overrides: DrawerStoryProps) {
  const args = { ...initialArgs, ...overrides };
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right" {...args}>
        <Drawer.Trigger render={<Button />}>Open Drawer</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Drawer Title</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p>This drawer slides in from the edge of the screen with a smooth transition.</p>
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
