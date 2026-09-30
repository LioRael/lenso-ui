"use client";

// Adapted from HeroUI v3.2.6 drawer-with-form (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer, Input, Label, TextField } from "@lenso/ui";
import { styles } from "./styles";

export function WithForm() {
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right">
        <Drawer.Trigger render={<Button variant="secondary" />}>Edit Profile</Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop />
          <Drawer.Viewport>
            <Drawer.Popup>
              <Drawer.Content>
                <Drawer.Close
                  aria-label="Close drawer"
                  render={
                    <Button isIconOnly size="sm" variant="tertiary" xstyle={styles.cornerClose} />
                  }
                >
                  <CloseIcon />
                </Drawer.Close>
                <Drawer.Header>
                  <Drawer.Title>Edit Profile</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <form {...stylex.props(styles.form)}>
                    <TextField fullWidth name="name">
                      <Label>Name</Label>
                      <Input type="text" placeholder="Enter your name" variant="secondary" />
                    </TextField>
                    <TextField fullWidth name="email">
                      <Label>Email</Label>
                      <Input type="email" placeholder="Enter your email" variant="secondary" />
                    </TextField>
                    <TextField fullWidth name="bio">
                      <Label>Bio</Label>
                      <Input placeholder="Tell us about yourself" variant="secondary" />
                    </TextField>
                  </form>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>Cancel</Drawer.Close>
                  <Drawer.Close render={<Button />}>Save Changes</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
