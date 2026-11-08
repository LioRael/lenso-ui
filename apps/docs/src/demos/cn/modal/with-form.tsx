"use client";

import { Envelope } from "@gravity-ui/icons";
import { useId, useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { Button, Input, Label, Modal, Surface, TextField } from "@lenso/ui";
const styles = stylex.create({
  popup: {
    maxWidth: 448,
  },
  icon: {
    backgroundColor: "var(--lenso-control-tint-subtle-fill)",
    color: "var(--lenso-tint-text)",
  },
  envelope: {
    width: 20,
    height: 20,
  },
  caption: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: "20px",
    color: "var(--lenso-label-secondary)",
  },
  body: {
    padding: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    width: "100%",
  },
});
export function WithForm() {
  const formId = useId();
  const [open, setOpen] = useState(false);
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <Modal.Trigger render={<Button />}>打开联系表单</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup placement="auto" xstyle={styles.popup}>
            <Modal.Close aria-label="Close dialog" />
            <Modal.Header>
              <Modal.Icon xstyle={styles.icon}>
                <Envelope {...stylex.props(styles.envelope)} />
              </Modal.Icon>
              <Modal.Title>联系我们</Modal.Title>
              <Modal.Description xstyle={styles.caption}>
                填写下方表单，我们会尽快回复。在移动端弹出键盘时，模态框会自动适配。
              </Modal.Description>
            </Modal.Header>
            <Modal.Body xstyle={styles.body}>
              <Surface variant="default">
                <form
                  id={formId}
                  {...stylex.props(styles.form)}
                  onSubmit={(event) => {
                    event.preventDefault();
                    setOpen(false);
                  }}
                >
                  <TextField name="name" xstyle={styles.field}>
                    <Label>姓名</Label>
                    <Input type="text" variant="secondary" placeholder="输入你的姓名" />
                  </TextField>
                  <TextField name="email" xstyle={styles.field}>
                    <Label>邮箱</Label>
                    <Input type="email" variant="secondary" placeholder="输入你的邮箱" />
                  </TextField>
                  <TextField name="phone" xstyle={styles.field}>
                    <Label>电话</Label>
                    <Input type="tel" variant="secondary" placeholder="输入你的电话号码" />
                  </TextField>
                  <TextField name="company" xstyle={styles.field}>
                    <Label>公司</Label>
                    <Input variant="secondary" placeholder="输入公司名称" />
                  </TextField>
                  <TextField name="message" xstyle={styles.field}>
                    <Label>留言</Label>
                    <Input variant="secondary" placeholder="输入留言内容" />
                  </TextField>
                </form>
              </Surface>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close render={<Button variant="bordered" />}>取消</Modal.Close>
              <Button type="submit" form={formId}>
                发送消息
              </Button>
            </Modal.Footer>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal>
  );
}
