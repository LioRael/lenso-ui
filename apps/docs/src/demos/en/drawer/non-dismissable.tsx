"use client";

import { Button, Drawer } from "@lenso/ui";

export function NonDismissable() {
  return (
    <Drawer
      side="bottom"
      onOpenChange={(_open, details) => {
        if (details.reason === "outside-press" || details.reason === "swipe") details.cancel();
      }}
    >
      <Drawer.Trigger render={<Button />}>Important Action</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Content>
        <Drawer.Layout>
          <Drawer.Header>
            <Drawer.Title>Confirm Action</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            <p>
              This drawer cannot be dismissed by clicking outside or dragging. You must use one of
              the buttons below.
            </p>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close render={<Button variant="bordered" />}>Cancel</Drawer.Close>
            <Drawer.Close render={<Button />}>Confirm</Drawer.Close>
          </Drawer.Footer>
        </Drawer.Layout>
      </Drawer.Content>
    </Drawer>
  );
}
