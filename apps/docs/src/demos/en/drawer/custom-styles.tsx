"use client";

// Adapted from HeroUI v3.2.6 drawer-custom-styles (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "./styles";

export function CustomStyles() {
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right">
        <Drawer.Trigger render={<Button variant="secondary" />}>Open filters</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop variant="blur" />
          <Drawer.Viewport>
            <Drawer.Popup xstyle={styles.filters}>
              <Drawer.Content>
                <Drawer.Header>
                  <Drawer.Title>Filters</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <p {...stylex.props(styles.muted)}>Narrow results by status, owner, or date.</p>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>Cancel</Drawer.Close>
                  <Drawer.Close render={<Button />}>Apply</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
