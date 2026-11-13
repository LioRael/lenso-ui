"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "./styles";

export function ScrollableContent() {
  return (
    <Drawer side="bottom">
      <Drawer.Trigger render={<Button />}>Terms & Conditions</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Content>
        <Drawer.Layout>
          <Drawer.Handle />
          <Drawer.Close aria-label="Close drawer" />
          <Drawer.Header>
            <Drawer.Title>Terms & Conditions</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i} {...stylex.props(styles.paragraph)}>
                Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus,
                sed porttitor quam.
              </p>
            ))}
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close render={<Button variant="bordered" />}>Decline</Drawer.Close>
            <Drawer.Close render={<Button />}>Accept</Drawer.Close>
          </Drawer.Footer>
        </Drawer.Layout>
      </Drawer.Content>
    </Drawer>
  );
}
