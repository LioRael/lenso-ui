// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { Check } from "@gravity-ui/icons";
import { Button, Description, FieldError, Form, Input, Label, TextField } from "@lenso/ui";
import { useState, type FormEvent } from "react";
import * as stylex from "@stylexjs/stylex";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const [result, setResult] = useState("");
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setResult(`Submitted locally for ${data.get("email")}. No data was sent to a server.`);
  }
  return (
    <Form xstyle={demoStyles.wideColumn} onSubmit={onSubmit} onReset={() => setResult("")}>
      <TextField name="email">
        <Label>邮箱</Label>
        <Input required type="email" placeholder="john@example.com" />
        <FieldError />
      </TextField>
      <TextField
        name="password"
        validate={(value) => {
          if (!/[A-Z]/.test(String(value))) return "密码至少需要包含一个大写字母";
          if (!/[0-9]/.test(String(value))) return "密码至少需要包含一个数字";
          return null;
        }}
      >
        <Label>密码</Label>
        <Input required minLength={8} type="password" placeholder="输入密码" />
        <Description>至少 8 个字符，且包含 1 个大写字母和 1 个数字</Description>
        <FieldError />
      </TextField>
      <div {...stylex.props(demoStyles.row)}>
        <Button type="submit">
          <Check aria-hidden="true" />
          提交
        </Button>
        <Button type="reset" variant="secondary">
          重置
        </Button>
      </div>
      {result && <output>{result}</output>}
    </Form>
  );
}
