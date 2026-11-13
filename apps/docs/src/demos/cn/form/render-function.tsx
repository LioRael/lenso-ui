"use client";

import { Check } from "@gravity-ui/icons";
import {
  GlassButton,
  Button,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
const styles = stylex.create({
  form: {
    display: "flex",
    width: 384,
    maxWidth: "100%",
    flexDirection: "column",
    gap: 16,
  },
  actions: {
    display: "flex",
    gap: 8,
  },
});
export function RenderFunction() {
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    alert(`表单提交数据：${JSON.stringify(data, null, 2)}`);
  }
  return (
    <Form xstyle={styles.form} data-custom="foo" onSubmit={onSubmit}>
      <TextField name="email">
        <Label required>邮箱</Label>
        <Input
          required
          type="email"
          placeholder="john@example.com"
          onInput={(event) => {
            const message = ((value: string) =>
              /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(String(value))
                ? null
                : "Please enter a valid email address")(event.currentTarget.value);
            event.currentTarget.setCustomValidity(message ?? "");
          }}
        />
        <FieldError />
      </TextField>
      <TextField name="password">
        <Label required>密码</Label>
        <Input
          required
          minLength={8}
          type="password"
          placeholder="输入密码"
          onInput={(event) => {
            const message = ((value: string) => {
              const password = String(value);
              if (password.length < 8) return "Password must be at least 8 characters";
              if (!/[A-Z]/.test(password))
                return "Password must contain at least one uppercase letter";
              if (!/[0-9]/.test(password)) return "Password must contain at least one number";
              return null;
            })(event.currentTarget.value);
            event.currentTarget.setCustomValidity(message ?? "");
          }}
        />
        <Description>至少 8 个字符，且包含 1 个大写字母和 1 个数字</Description>
        <FieldError />
      </TextField>
      <div {...stylex.props(styles.actions)}>
        <Button type="submit">
          <Check aria-hidden="true" />
          提交
        </Button>
        <GlassButton type="reset" variant="default">
          重置
        </GlassButton>
      </div>
    </Form>
  );
}
