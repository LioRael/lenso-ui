// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

import { FloppyDisk } from "@gravity-ui/icons";
import * as stylex from "@stylexjs/stylex";
import { descriptionStyles } from "@lenso/tokens/description";
import {
  Button,
  Description,
  FieldError,
  FieldGroup,
  Fieldset,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@lenso/ui";
import { useId, useState, type FormEvent } from "react";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const [result, setResult] = useState("");
  const descriptionId = useId();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult("Profile updated in this local demonstration.");
  }
  return (
    <Form xstyle={demoStyles.wideColumn} onSubmit={onSubmit} onReset={() => setResult("")}>
      <Fieldset aria-describedby={descriptionId}>
        <Fieldset.Legend>个人资料设置</Fieldset.Legend>
        <p id={descriptionId} {...stylex.props(descriptionStyles.description)}>
          更新你的个人资料信息。
        </p>
        <FieldGroup>
          <TextField name="name">
            <Label>姓名</Label>
            <Input required minLength={3} placeholder="John Doe" />
            <FieldError />
          </TextField>
          <TextField name="email">
            <Label>邮箱</Label>
            <Input required type="email" placeholder="john@example.com" />
            <FieldError />
          </TextField>
          <TextField name="bio">
            <Label>简介</Label>
            <TextArea required minLength={10} placeholder="介绍一下你自己…" />
            <Description>至少 10 个字符</Description>
            <FieldError />
          </TextField>
        </FieldGroup>
        <Fieldset.Actions>
          <Button type="submit">
            <FloppyDisk aria-hidden="true" />
            保存更改
          </Button>
          <Button type="reset" variant="secondary">
            取消
          </Button>
        </Fieldset.Actions>
      </Fieldset>
      {result && <output>{result}</output>}
    </Form>
  );
}
