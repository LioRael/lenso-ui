"use client";

import * as stylex from "@stylexjs/stylex";
import { Button, Drawer, Input, Label, TextField } from "@lenso/ui";
import { styles } from "../../en/drawer/styles";
export function WithForm() {
  return (
    <Drawer side="right">
      <Drawer.Trigger render={<Button />}>编辑资料</Drawer.Trigger>
      <Drawer.Backdrop />
      <Drawer.Content>
        <Drawer.Layout>
          <Drawer.Close aria-label="Close drawer" />
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
            <Drawer.Close render={<Button variant="bordered" />}>取消</Drawer.Close>
            <Drawer.Close render={<Button />}>保存更改</Drawer.Close>
          </Drawer.Footer>
        </Drawer.Layout>
      </Drawer.Content>
    </Drawer>
  );
}
