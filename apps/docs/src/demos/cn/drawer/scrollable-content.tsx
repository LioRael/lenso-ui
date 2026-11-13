"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
export function ScrollableContent() {
  return (
    <Drawer side="bottom">
      <Drawer.Trigger render={<Button />}>条款与条件</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Content>
        <Drawer.Layout>
          <Drawer.Handle />
          <Drawer.Close aria-label="Close drawer" />
          <Drawer.Header>
            <Drawer.Title>条款与条件</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body>
            {Array.from(
              {
                length: 20,
              },
              (_, i) => (
                <p key={i} {...stylex.props(styles.paragraph)}>
                  段落{i + 1}：Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                  pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit
                  risus, sed porttitor quam.
                </p>
              ),
            )}
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close render={<Button variant="bordered" />}>拒绝</Drawer.Close>
            <Drawer.Close render={<Button />}>接受</Drawer.Close>
          </Drawer.Footer>
        </Drawer.Layout>
      </Drawer.Content>
    </Drawer>
  );
}
