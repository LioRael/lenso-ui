"use client";

// Adapted from HeroUI v3.2.6 drawer-placements (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer } from "@lenso/ui";
import { styles } from "./styles";

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
                        This drawer slides in from the <strong>{placement}</strong> edge of the
                        screen.
                      </p>
                    </Drawer.Body>
                    <Drawer.Footer>
                      <Drawer.Close render={<Button variant="secondary" />}>Cancel</Drawer.Close>
                      <Drawer.Close render={<Button />}>Done</Drawer.Close>
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
