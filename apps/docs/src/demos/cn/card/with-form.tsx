// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Button, Card, Form, Input, Label, Link, TextField } from "@lenso/ui";
import type { FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { s } from "../../en/card/display.stylex";
export function WithForm() {
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert("Form submitted successfully!");
  };
  return (
    <Card xstyle={s.maxMd}>
      <Card.Header>
        <Card.Title>登录</Card.Title>
        <Card.Description>输入账号信息以访问您的账户</Card.Description>
      </Card.Header>
      <Form onSubmit={onSubmit}>
        <Card.Content>
          <div {...stylex.props(s.column4)}>
            <TextField name="email">
              <Label>邮箱</Label>
              <Input
                name="email"
                type="email"
                placeholder="email@example.com"
                variant="secondary"
              />
            </TextField>
            <TextField name="password">
              <Label>密码</Label>
              <Input name="password" type="password" placeholder="••••••••" variant="secondary" />
            </TextField>
          </div>
        </Card.Content>
        <Card.Footer xstyle={s.formFooter}>
          <Button xstyle={s.full} type="submit">
            登录
          </Button>
          <Link xstyle={[s.centerText, s.textSm]} href="#">
            忘记密码？
          </Link>
        </Card.Footer>
      </Form>
    </Card>
  );
}
