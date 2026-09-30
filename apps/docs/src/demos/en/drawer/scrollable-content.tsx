"use client";

// Adapted from HeroUI v3.2.6 drawer-scrollable-content (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer } from "@lenso/ui";
import { styles } from "./styles";

export function ScrollableContent() {
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="down">
        <Drawer.Trigger render={<Button variant="secondary" />}>Terms & Conditions</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Handle />
                <Drawer.Close
                  aria-label="Close drawer"
                  render={
                    <Button isIconOnly size="sm" variant="tertiary" xstyle={styles.cornerClose} />
                  }
                >
                  <CloseIcon />
                </Drawer.Close>
                <Drawer.Header>
                  <Drawer.Title>Terms & Conditions</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  {Array.from({ length: 20 }, (_, i) => (
                    <p key={i} {...stylex.props(styles.paragraph)}>
                      Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet
                      hendrerit risus, sed porttitor quam.
                    </p>
                  ))}
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>Decline</Drawer.Close>
                  <Drawer.Close render={<Button />}>Accept</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
