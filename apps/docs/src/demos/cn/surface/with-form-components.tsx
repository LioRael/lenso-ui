"use client";
import { Fieldset, Input, TextArea, TextField } from "@lenso/ui";
import { s } from "../../en/card/display.stylex";

export function WithFormComponents() {
  return (
    <Fieldset xstyle={s.maxMd}>
      <Fieldset.Legend>个人资料</Fieldset.Legend>
      <Fieldset.Group>
        <TextField name="name">
          <TextField.Label>姓名</TextField.Label>
          <Input placeholder="姓名" />
        </TextField>
        <TextField name="notes" layout="stacked">
          <TextField.Label>备注</TextField.Label>
          <TextArea placeholder="添加备注" fullWidth />
        </TextField>
      </Fieldset.Group>
    </Fieldset>
  );
}
