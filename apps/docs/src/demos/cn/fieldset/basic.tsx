"use client";

import { FloppyDisk } from "@gravity-ui/icons";
import {
  GlassButton,
  Button,
  Description,
  FieldError,
  Fieldset,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@lenso/ui";
import { useId, type FormEvent } from "react";
import { demoStyles } from "../../demo.stylex";
export function Basic() {
  const descriptionId = useId();
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    alert("表单提交成功！");
  }
  return (
    <Form xstyle={demoStyles.wideColumn} onSubmit={onSubmit}>
      <Fieldset aria-describedby={descriptionId}>
        <Fieldset.Legend>个人资料设置</Fieldset.Legend>
        <Description id={descriptionId}>更新你的个人资料信息。</Description>
        <Fieldset.Group>
          <TextField name="name">
            <Label required>姓名</Label>
            <Input
              required
              placeholder="John Doe"
              onInput={(event) => {
                const message = ((value: string) =>
                  String(value).length < 3 ? "Name must be at least 3 characters" : null)(
                  event.currentTarget.value,
                );
                event.currentTarget.setCustomValidity(message ?? "");
              }}
            />
            <FieldError />
          </TextField>
          <TextField name="email">
            <Label required>邮箱</Label>
            <Input required type="email" placeholder="john@example.com" />
            <FieldError />
          </TextField>
          <TextField name="bio" layout="stacked">
            <Label required>简介</Label>
            <TextArea
              required
              placeholder="介绍一下你自己…"
              onInput={(event) => {
                const message = ((value: string) =>
                  String(value).length < 10 ? "Bio must be at least 10 characters" : null)(
                  event.currentTarget.value,
                );
                event.currentTarget.setCustomValidity(message ?? "");
              }}
            />
            <Description>至少 10 个字符</Description>
            <FieldError />
          </TextField>
        </Fieldset.Group>
        <Fieldset.Actions>
          <Button type="submit">
            <FloppyDisk aria-hidden="true" />
            保存更改
          </Button>
          <GlassButton type="reset" variant="default">
            取消
          </GlassButton>
        </Fieldset.Actions>
      </Fieldset>
    </Form>
  );
}
