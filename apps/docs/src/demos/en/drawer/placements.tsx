"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "./styles";

export function Placements() {
  const placements = ["bottom", "top", "left", "right"] as const;
  return (
    <div {...stylex.props(styles.row)}>
      {placements.map((placement) => (
        <Drawer key={placement} side={placement}>
          <Drawer.Trigger render={<Button />}>
            {placement.charAt(0).toUpperCase() + placement.slice(1)}
          </Drawer.Trigger>
          <Drawer.Backdrop />
          <Drawer.Content>
            <Drawer.Layout>
              <Drawer.Close aria-label="Close drawer" />
              {placement === "bottom" && <Drawer.Handle />}
              <Drawer.Header>
                <Drawer.Title>
                  {placement.charAt(0).toUpperCase() + placement.slice(1)}Drawer
                </Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <p>
                  This drawer slides in from the <strong>{placement}</strong>edge of the screen.
                </p>
              </Drawer.Body>
              <Drawer.Footer>
                <Drawer.Close render={<Button variant="bordered" />}>Cancel</Drawer.Close>
                <Drawer.Close render={<Button />}>Done</Drawer.Close>
              </Drawer.Footer>
              {placement === "top" && <Drawer.Handle />}
            </Drawer.Layout>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  );
}
