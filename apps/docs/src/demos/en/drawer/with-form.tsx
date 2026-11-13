"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer, Input, Label, TextField } from "@lenso/ui";
import { styles } from "./styles";

export function WithForm() {
  return (
    <Drawer side="right">
      <Drawer.Trigger render={<Button />}>Edit Profile</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Content>
        <Drawer.Layout>
          <Drawer.Close aria-label="Close drawer" />
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
            <Drawer.Close render={<Button variant="bordered" />}>Cancel</Drawer.Close>
            <Drawer.Close render={<Button />}>Save Changes</Drawer.Close>
          </Drawer.Footer>
        </Drawer.Layout>
      </Drawer.Content>
    </Drawer>
  );
}
