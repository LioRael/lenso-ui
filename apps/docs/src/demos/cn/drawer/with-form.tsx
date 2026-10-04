// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 drawer-with-form (Apache-2.0).
import * as stylex from "@stylexjs/stylex";
import { Button, CloseIcon, Drawer, Input, Label, TextField } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
export function WithForm() {
  return (
    <Drawer.Provider>
      <Drawer swipeDirection="right">
        <Drawer.Trigger render={<Button variant="secondary" />}>编辑资料</Drawer.Trigger>
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
                  <Drawer.Title>编辑资料</Drawer.Title>
                </Drawer.Header>
                <Drawer.Body>
                  <form {...stylex.props(styles.form)}>
                    <TextField fullWidth name="name">
                      <Label>姓名</Label>
                      <Input type="text" placeholder="输入你的姓名" variant="secondary" />
                    </TextField>
                    <TextField fullWidth name="email">
                      <Label>邮箱</Label>
                      <Input type="email" placeholder="输入你的邮箱" variant="secondary" />
                    </TextField>
                    <TextField fullWidth name="bio">
                      <Label>简介</Label>
                      <Input placeholder="介绍一下你自己" variant="secondary" />
                    </TextField>
                  </form>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close render={<Button variant="secondary" />}>取消</Drawer.Close>
                  <Drawer.Close render={<Button />}>保存更改</Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer>
    </Drawer.Provider>
  );
}
